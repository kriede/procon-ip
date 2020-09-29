import { AbstractService } from './abstract-service';
import { GetStateService } from './get-state.service';
import { GetStateData } from './get-state-data';
import { GetStateDataObject } from './get-state-data-object';
import { RelayDataInterpreter, RelayStateBitMask } from './relay-data-interpreter';
import axios, { AxiosPromise, Method } from 'axios';
import { ServiceConfig } from './service-config';
import { Log } from './logger';

export enum SetStateValue {
  ON = 1,
  OFF = 0,
  AUTO = 2,
}

export class UsrcfgCgiService extends AbstractService {
  public _endpoint = '/usrcfg.cgi';
  public _method: Method = 'post';

  private stateData: GetStateData;

  private getStateService: GetStateService;

  private relayDataInterpreter: RelayDataInterpreter;

  public constructor(
    config: ServiceConfig,
    logger: Log,
    getStateService: GetStateService,
    relayDataInterpreter: RelayDataInterpreter,
  ) {
    super(config, logger);
    this.relayDataInterpreter = relayDataInterpreter;
    this.getStateService = getStateService;
    this.stateData = this.getStateService.data;
    this._requestHeaders['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
  }

  public async setOn(relayData: GetStateDataObject): Promise<number> {
    return this.setState(relayData, SetStateValue.ON);
  }

  public async setOff(relayData: GetStateDataObject): Promise<number> {
    return this.setState(relayData, SetStateValue.OFF);
  }

  public async setAuto(relayData: GetStateDataObject): Promise<number> {
    return this.setState(relayData, SetStateValue.AUTO);
  }

  private async setState(relay: GetStateDataObject, state: SetStateValue | number): Promise<number> {
    for (let errors = 0; errors < 3; errors++) {
      try {
        const returnValue = await this._setState(relay, state);
        return new Promise<number>(() => returnValue);
      } catch (e) {
        this.log.debug(`Error sending relay control command: ${e}`);
      }
    }

    return new Promise<number>(() => -1);
  }

  private async _setState(relay: GetStateDataObject, state: SetStateValue | number): Promise<number> {
    let data: [number, number] | undefined;
    let desiredValue: number;
    /* tslint:disable: no-bitwise */
    switch (state) {
      case SetStateValue.AUTO:
        data = this.relayDataInterpreter.evaluate(this.getStateService.data).setAuto(relay);
        desiredValue = relay.raw & ~RelayStateBitMask.manual;
        break;
      case SetStateValue.ON:
        data = this.relayDataInterpreter.evaluate(this.getStateService.data).setOn(relay);
        desiredValue = RelayStateBitMask.manual | RelayStateBitMask.on;
        break;
      case SetStateValue.OFF:
      default:
        data = this.relayDataInterpreter.evaluate(this.getStateService.data).setOff(relay);
        desiredValue = RelayStateBitMask.manual | ~RelayStateBitMask.on;
        break;
    }
    /* tslint:enable: no-bitwise */

    this.log.info(`usrcfg.cgi data: ${JSON.stringify(data)}`);
    return new Promise<number>((resolve, reject) => {
      if (data === undefined) {
        return reject('Cannot determine request data for relay switching');
      }

      this.send(data)
        .then((response) => {
          this.log.info(`usrcfg.cgi response: ${JSON.stringify(response.data)}`);
          this.log.info(`usrcfg.cgi status: (${response.status}) ${response.statusText}`);
          // if (["continue", "done"].indexOf(response.data.toLowerCase()) >= 0) {
          if (response.status === 200) {
            this.getStateService.update();
            resolve(desiredValue);
          } else {
            reject(
              `(${response.status}: ${response.statusText}) Error sending relay control command: ${response.data}`,
            );
          }
        })
        .catch((e) => {
          reject(`Error sending relay control command: ${e.response ? e.response : e}`);
        });
    });
  }

  private send(bitTupel: [number, number]): AxiosPromise /*<{data: string; status: number; statusText: string}>*/ {
    // private send(bitTupel: [number, number]): /*Axios*/Promise<{data: string; status: number; statusText: string}> {
    const requestConfig = this.axiosRequestConfig;
    requestConfig.data = `ENA=${encodeURIComponent(bitTupel.join(','))}&MANUAL=1`;

    return axios.request(requestConfig);
  }
}
