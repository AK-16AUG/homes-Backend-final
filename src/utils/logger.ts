

enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

const timestamp = (): string => new Date().toISOString();

export const logger = {
  info: (message: string, ...optionalParams: any[]) => {
    console.info(`[${LogLevel.INFO}] [${timestamp()}] ${message}`, ...optionalParams);
  },

  warn: (message: string, ...optionalParams: any[]) => {
    console.warn(`[${LogLevel.WARN}] [${timestamp()}] ${message}`, ...optionalParams);
  },

  error: (message: string, ...optionalParams: any[]) => {
    console.error(`[${LogLevel.ERROR}] [${timestamp()}] ${message}`, ...optionalParams);
  },

  debug: (message: string, ...optionalParams: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[${LogLevel.DEBUG}] [${timestamp()}] ${message}`, ...optionalParams);
    }
  },
};
