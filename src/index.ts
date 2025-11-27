import { createServer } from "./server";
import { config } from "./config";
import { startConsumer } from "./consumer";

async function main() {
  const app = createServer();
  app.listen(config.port, () => {
    console.log(`[api] listening on port ${config.port}`);
  });

  // Start Kafka consumer worker
  startConsumer().catch((err) => {
    console.error("[consumer] failed to start", err);
    process.exit(1);
  });
}

main().catch((err) => {
  console.error("[main] fatal error", err);
  process.exit(1);
});
