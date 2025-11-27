export const config = {
  port: Number(process.env.PORT) || 3000,
  kafkaBrokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
  kafkaClientId: process.env.KAFKA_CLIENT_ID || "task-service",
  kafkaTasksTopic: process.env.KAFKA_TASKS_TOPIC || "tasks",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  cacheTtlSeconds: Number(process.env.CACHE_TTL_SECONDS) || 3600
};
