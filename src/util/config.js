const config = {
  app: {
    host: process.env.HOST,
    port: process.env.PORT,
  },
  redis: {
    host: process.env.REDIS_SERVER,
  },
  rabbitMq: {
    server: process.env.RABBITMQ_SERVER,
  },
};

module.exports = config;
