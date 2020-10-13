/**
 * This file exports a simple fallback logger and its interface defintion.
 * 
 * Use the interface to replace the fallback logger and instead integrate the
 * preferred logger of your own project. You can also extend the fallback logger
 * to integrate your preferred log methods within the simplified logging 
 * mechanism of this module.
 * @packageDocumentation
 */

/**
 * Interface for compatible loggers.
 * 
 * Must at least support the log levels `debug`, `info`, `warn` and `error`.
 */
export interface Log {
  /**
   * Log a message with severity `debug`.
   * 
   * @param message The debug message.
   */
  debug(message: string): void;

  /**
   * Log a message with severity `info`.
   * 
   * @param message The information.
   */
  info(message: string): void;

  /**
   * Log a message with severity `warn`.
   * 
   * @param message The warning.
   */
  warn(message: string): void;

  /**
   * Log a message with severity `error`.
   * 
   * @param message The error message.
   */
  error(message: string): void;
}

/**
 * Console logger as default fallback.
 * 
 * This logger uses the `console.log` method and simply prepends a timestamp
 * plus the used log level in uppercase. You can write your own custom logger 
 * or pass any other (e.g. ioBroker has a suitable logger on board), that 
 * matches the `Log` interface.
 */
export class Logger implements Log {
  /**
   * Log a message with severity `debug` to console.
   * 
   * @param message The debug message.
   */
  public debug(message: string): void {
    console.log(`(${this.timestamp}) DEBUG: ${message}`); // tslint:disable-line: no-console
  }

  /**
   * Log a message with severity `info`.
   * 
   * @param message The information.
   */
  public info(message: string): void {
    console.log(`(${this.timestamp}) INFO: ${message}`); // tslint:disable-line: no-console
  }

  /**
   * Log a message with severity `warn` to console.
   * 
   * @param message The warning.
   */
  public warn(message: string): void {
    console.log(`(${this.timestamp}) WARNING: ${message}`); // tslint:disable-line: no-console
  }

  /**
   * Log a message with severity `error` to console.
   * 
   * @param message The error message.
   */
  public error(message: string): void {
    console.error(`(${this.timestamp}) ERROR: ${message}`); // tslint:disable-line: no-console
  }

  /**
   * Get current datetime with milliseconds.
   * 
   * @returns An ISO 8601 conform timestamp (e.g. 2020-10-10T12:34:56.789Z).
   */
  protected get timestamp(): string {
    return new Date().toISOString();
  }
}
