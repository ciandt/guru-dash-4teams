import pino from 'pino';

const messageFormatter = (log: any, messageKey: string) => {
  if (log && log.isAxiosError) {
    let message = log[messageKey];

    if (log.config) {
      if (log.config.url) {
        message += `\nURL: ${log.config.url}`;
      }

      if (log.config.method) {
        message += `\nMethod: ${log.config.method.toUpperCase()}`;
      }
    }

    if (log.response && log.response.data) {
      message += `\nResponse: ${JSON.stringify(log.response.data)}`;
    }

    return message;
  }

  const message = log[messageKey];
  if (log.requestId) return `[${log.requestId}] ${message}`;
  return message;
};

export const logger = pino({
  prettyPrint: {
    translateTime: true,
    messageFormat: messageFormatter
  },
  level: 'debug'
});