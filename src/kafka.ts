import { Kafka, Producer, Consumer } from "kafkajs";
import { config } from "./config";

const kafka = new Kafka({
  clientId: config.kafkaClientId,
  brokers: config.kafkaBrokers
});

let producer: Producer | null = null;

export async function getProducer(): Promise<Producer> {
  if (!producer) {
    producer = kafka.producer();
    await producer.connect();
    console.log("[kafka] producer connected");
  }
  return producer;
}

export function createConsumer(groupId: string): Consumer {
  return kafka.consumer({ groupId });
}
