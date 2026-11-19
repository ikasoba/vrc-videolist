import { Hono, Context, type MiddlewareHandler } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { readFile } from "node:fs/promises";
import QueueController, { type QueueControllerContext } from "./controllers/queue.ts";
import { KVSQueueService } from "./implements/queue/kvs.ts";
import { createIdFactory } from "./domains/id.ts";
import { join } from "node:path";

export interface ApplicationContext extends QueueControllerContext { }

async function createBinder(): Promise<MiddlewareHandler<ApplicationContext>> {
  const idFactory = createIdFactory(
    new Date("1969-10-10T00:00:00.000+09:00").getTime()
  );

  const kvs = new Map<string, unknown>();
  const queues = new KVSQueueService(
    {
      async set(key, data) {
        kvs.set(key, data);
      },
      async get(key) {
        return kvs.get(key);
      },
      async delete(key) {
        return kvs.delete(key);
      },
    },
    idFactory
  );

  return (ctx: Context<QueueControllerContext>, next) => {
    ctx.set("queues", queues);

    return next();
  };
}

const assetRoot = process.env.ASSET_ROOT ?? "./../client/dist/";

const staticAssets = serveStatic({
  root: assetRoot,
});

const app =
  new Hono()
    .use(await createBinder())
    .get("/", staticAssets)
    .get("/queue/:id", serveStatic({ path: join(assetRoot, "./index.html") }))
    .get("/assets/*", staticAssets)
    .route("/q", QueueController);

export default app;
