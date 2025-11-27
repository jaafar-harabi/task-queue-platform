import { createConsumer } from "./kafka";
import { redis } from "./redis";
import { config } from "./config";

type TaskMessage = {
  id: string;
  payload: {
    type: string;
    data: unknown;
  };
};

const TASK_PREFIX = "task:";

async function processTask(msg: TaskMessage): Promise<unknown> {
  if (msg.payload.type === "uppercase" && typeof msg.payload.data === "string") {
    return (msg.payload.data as string).toUpperCase();
  }

  return {
    receivedAt: new Date().toISOString(),
    data: msg.payload.data
  };
}

export async function startConsumer() {
  const consumer = createConsumer("task-consumer-group");
  await consumer.connect();
  await consumer.subscribe({ topic: config.kafkaTasksTopic, fromBeginning: false });

  console.log("[kafka] consumer started");

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;
      const value = message.value.toString();
      const parsed: TaskMessage = JSON.parse(value);
      const key = `${TASK_PREFIX}${parsed.id}`;

      console.log("[consumer] processing task", parsed.id);

      await redis.set(
        key,
        JSON.stringify({ id: parsed.id, status: "PROCESSING" }),
        "EX",
        config.cacheTtlSeconds
      );

      try {
        const result = await processTask(parsed);

        await redis.set(
          key,
          JSON.stringify({ id: parsed.id, status: "DONE", result }),
          "EX",
          config.cacheTtlSeconds
        );
      } catch (err: any) {
        console.error("[consumer] error processing task", err);
        await redis.set(
          key,
          JSON.stringify({
            id: parsed.id,
            status: "FAILED",
            error: err?.message || "unknown error"
          }),
          "EX",
          config.cacheTtlSeconds
        );
      }
    }
  });
}
