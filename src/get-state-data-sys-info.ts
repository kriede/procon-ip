/**
 * The [[`GetStateDataSysInfo`]] class is part of the [[`GetStateData`]]
 * class, which is kind of an object representation of the `/GetState.csv`
 * API endpoint response of the ProCon.IP pool controller.
 * @packageDocumentation
 */

import { GetStateDataObject } from './get-state-data-object';

/**
 * A class for an object representation of the first line of the `/GetState.csv`
 * API endpoint response. This line has a special role and no relation to the
 * subsequent lines of the CSV file.
 */
export class GetStateDataSysInfo {
  /**
   * Making [[`GetStateDataSysInfo`]] objects extensible, also allows accessing
   * object keys using string variables.
   */
  [key: string]: any;

  /**
   *
   */
  public time!: string;

  /**
   * Uptime of the ProCon.IP controller at the time this data was requested.
   */
  public uptime!: number;

  /**
   * Current firmware version string.
   */
  public version!: string;

  /**
   * Reset root cause.
   *
   * Values are documented bitwise as follows:
   *  - Bit 4: External reset
   *  - Bit 3: PowerUp reset
   *  - Bit 2: Brown out reset
   *  - Bit 1: Watchdog reset
   *  - Bit 0: SW reset
   *
   * See manual for more information or updates: http://www.pooldigital.de/trm/TRM_ProConIP.pdf
   */
  public resetRootCause!: number;

  /**
   * NTP fault state.
   *
   * Values are documented bitwise as follows:
   *  - Bit 16: NTP available
   *  - Bit 15..3: reserved
   *  - Bit 2: Error
   *  - Bit 1: Warning
   *  - Bit 0: Logfile
   *
   * See manual for more information or updates: http://www.pooldigital.de/trm/TRM_ProConIP.pdf
   */
  public ntpFaultState!: number;

  /**
   * Other config flags.
   *
   * Values are documented bitwise as follows:
   *  - Bit 8: Extension an SPI (`0`) oder DMX (`1`)
   *  - Bit 7: Repeated Mails
   *  - Bit 6: FlowSensor
   *  - Bit 5: High Bus Load
   *  - Bit 4: Relais Extension
   *  - Bit 3: Avatar
   *  - Bit 2: DMX
   *  - Bit 1: SD-Card
   *  - Bit 0: TCP-IP Boost
   *
   * See manual for more information or updates: http://www.pooldigital.de/trm/TRM_ProConIP.pdf
   */
  public configOtherEnable!: number;

  /**
   * Dosage control information flags.
   *
   * Values are documented bitwise as follows:
   *  - Bit 12: pH+ enabled
   *  - Bit 11..9: reserved
   *  - Bit 8: pH- enabled
   *  - Bit 7..5: reserved
   *  - Bit 4: Cl liquid || Elektrolysis
   *  - Bit 3..1: reserved
   *  - Bit 0: CL enabled
   *
   * See manual for more information or updates: http://www.pooldigital.de/trm/TRM_ProConIP.pdf
   */
  public dosageControl!: number;

  /**
   * pH+ dosage relay id.
   */
  public phPlusDosageRelais!: number;

  /**
   * pH- dosage relay id.
   */
  public phMinusDosageRelais!: number;

  /**
   * Chlorine dosage relay id.
   */
  public chlorineDosageRelais!: number;

  /**
   * Initialize a new [[`GetStateDataSysInfo`]] object.
   *
   * @param data Parsed response CSV of the `/GetState.csv` endpoint as
   *             2-dimensional array (see: [[`GetStateData.parsed`]])
   */
  public constructor(data?: string[][]) {
    if (data) {
      this.setValuesFromArray(data);
    }
  }

  /**
   * Set values from based on a 2-dimensional array structure.
   *
   * @param data Parsed response CSV of the `/GetState.csv` endpoint as
   *             2-dimensional array (see: [[`GetStateData.parsed`]])
   */
  public setValuesFromArray(data: string[][]): void {
    this.version = data[0][1];
    this.uptime = Number(data[0][2]);
    this.resetRootCause = Number(data[0][3]);
    this.ntpFaultState = Number(data[0][4]);
    this.configOtherEnable = Number(data[0][5]);
    this.dosageControl = Number(data[0][6]);
    this.phPlusDosageRelais = Number(data[0][7]);
    this.phMinusDosageRelais = Number(data[0][8]);
    this.chlorineDosageRelais = Number(data[0][9]);
  }

  /**
   * Converts the object instance to a simple array of objects for better
   * handling/iteration.
   */
  public toArrayOfObjects(): { key: string; value: string }[] {
    const values = new Array<{ key: string; value: string }>();
    Object.keys(this).forEach((attr: string) => {
      values.push({ key: attr, value: this[attr] });
    });

    return values;
  }

  /**
   * Check whether the automated chlorine dosage is enabled.
   */
  public isChlorineDosageEnabled(): boolean {
    /* tslint:disable: no-bitwise */
    return (this.dosageControl & 1) === 1;
    /* tslint:enable: no-bitwise */
  }

  /**
   * Checks if the chlorine dosage device is configured as an electrolysis cell or a pump..
   */
   public isElectrolysis(): boolean {
    /* tslint:disable: no-bitwise */
    return (this.dosageControl & 16) === 16;
    /* tslint:enable: no-bitwise */
  }

  /**
   * Check whether the automated pH- dosage is enabled.
   */
  public isPhMinusDosageEnabled(): boolean {
    /* tslint:disable: no-bitwise */
    return (this.dosageControl & 256) === 256;
    /* tslint:enable: no-bitwise */
  }

  /**
   * Check whether the automated pH+ dosage is enabled.
   */
  public isPhPlusDosageEnabled(): boolean {
    /* tslint:disable: no-bitwise */
    return (this.dosageControl & 4096) === 4096;
    /* tslint:enable: no-bitwise */
  }

  /**
   * Check whether the given [[`GetStateDataObject`]] object is a dosage control
   * relay.
   *
   * @param object The [[`GetStateDataObject`]] to check.
   */
  public isDosageEnabled(object: GetStateDataObject): boolean {
    switch (object.id) {
      case 36:
      case 39:
        return this.isChlorineDosageEnabled();
      case 37:
      case 40:
        return this.isPhMinusDosageEnabled();
      case 38:
      case 41:
        return this.isPhPlusDosageEnabled();
      default:
        return false;
    }
  }

  /**
   * Returns the configured dosage relais for a given
   * [[`GetStateDataObject`]] object.
   *
   * @param object The [[`GetStateDataObject`]] to check, should be a
   * [[`GetStateData.categories.canister`]] or a
   * [[`GetStateData.categories.canisterConsumptions`]] object.
   */
  public getDosageRelais(object: GetStateDataObject): number {;
    switch (object.id) {
      case 36:
      case 39:
        return this.chlorineDosageRelais;
      case 37:
      case 40:
        return this.phMinusDosageRelais;
      case 38:
      case 41:
        return this.phPlusDosageRelais;
      default:
        return 0;
    }
  }

  /**
   * Check whether generation of an avatar image is enabled  or not.
   */
   public isAvatarEnabled(): boolean {
    /* tslint:disable: no-bitwise */
    return (this.configOtherEnable & 8) === 8;
    /* tslint:enable: no-bitwise */
  }

  /**
   * Check whether external relays are enabled or not.
   */
   public isExtRelaysEnabled(): boolean {
    /* tslint:disable: no-bitwise */
    return (this.configOtherEnable & 16) === 16;
    /* tslint:enable: no-bitwise */
  }

  /**
   * Check whether the digitial input 0 is configured as a flow sensor
   * or not.
   */
   public isFlowSensorEnabled(): boolean {
    /* tslint:disable: no-bitwise */
    return (this.configOtherEnable & 64) === 64;
    /* tslint:enable: no-bitwise */
  }

  /**
   * Check whether DMX is enabled or not.
   */
   public isDmxEnabled(): boolean {
    /* tslint:disable: no-bitwise */
    return (this.configOtherEnable & 256) === 256;
    /* tslint:enable: no-bitwise */
  }
}
