import express from "express";
import { v4 as uuidv4 } from "uuid";
import { getProducer } from "./kafka";
import { redis } from "./redis";
import { config } from "./config";

const app = express();
app.use(express.json());

type TaskPayload = {
  type: string;
  data: unknown;
};

type TaskStatus = "PENDING" | "PROCESSING" | "DONE" | "FAILED";

type TaskResult = {
  id: string;
  status: TaskStatus;
  result?: unknown;
  error?: string;
};

const TASK_PREFIX = "task:";

// Health
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Create task -> send to Kafka & cache initial state
app.post("/tasks", async (req, res) => {
  const payload: TaskPayload = req.body;

  if (!payload || typeof payload.type !== "string") {
    return res.status(400).json({ error: "Invalid payload: missing 'type'" });
  }

  const id = uuidv4();
  const task: TaskResult = {
    id,
    status: "PENDING"
  };

  try {
    const producer = await getProducer();
    await producer.send({
      topic: config.kafkaTasksTopic,
      messages: [
        {
          key: id,
          value: JSON.stringify({ id, payload })
        }
      ]
    });

    await redis.set(
      `${TASK_PREFIX}${id}`,
      JSON.stringify(task),
      "EX",
      config.cacheTtlSeconds
    );

    res.status(202).json({
      message: "Task accepted",
      taskId: id
    });
  } catch (err) {
    console.error("[api] error creating task", err);
    res.status(500).json({ error: "Failed to enqueue task" });
  }
});

// Get task status/result (from cache)
app.get("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const key = `${TASK_PREFIX}${id}`;

  const cached = await redis.get(key);
  if (!cached) {
    return res.status(404).json({ error: "Task not found" });
  }

  const task: TaskResult = JSON.parse(cached);
  res.json(task);
});

export function createServer() {
  return app;
}
