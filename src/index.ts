import { createServer } from "./server";
import { config } from "./config";

async function main() {
  const app = createServer();
  app.listen(config.port, () => {
    console.log(`[api] listening on port ${config.port}`);
  });
}

main().catch((err) => {
  console.error("[main] fatal error", err);
  process.exit(1);
});
