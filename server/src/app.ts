import { Hono, Context, type MiddlewareHandler } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import QueueController, { type QueueControllerContext } from "./controllers/queue.ts";
import MiAuthController, { MiAuthOptions, type MiAuthContext } from "./controllers/miauth.ts";
import { KVSQueueService } from "./implements/queue/kvs.ts";
import { createIdFactory } from "./domains/id.ts";
import { join } from "node:path";
import { createKVS } from "./implements/kvs/lmdb.ts";
import type { Realm } from "./domains/session.ts";
import { readFile } from "node:fs/promises";
import { useSession } from "@hono/session";

export type ApplicationContext =
  & QueueControllerContext
  & MiAuthContext
  ;

async function createBinder(): Promise<MiddlewareHandler<ApplicationContext>> {
  const idFactory = createIdFactory(
    new Date("1969-10-10T00:00:00.000+09:00").getTime()
  );

  const aborter = new AbortController();
  process.on("beforeExit", () => {
      if (!aborter.signal.aborted) aborter.abort();
    });

  const queues = new KVSQueueService(
    createKVS(".db", aborter.signal),
    idFactory
  );

  const miAuthOptions =
    await readFile(process.env.MIAUTH_OPTIONS_PATH ?? "./miauth_options.json", "utf-8")
      .then(x => MiAuthOptions.parse(JSON.parse(x)))
      ;

  const realm: Realm = {
    async createUserSession() {
        return {
          id: crypto.randomUUID(),
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toJSON()
        }
    },
    async delete() {},
  };

  return (ctx: Context<ApplicationContext>, next) => {
    ctx.set("queues", queues);
    ctx.set("realm", realm);
    ctx.set("miauth", miAuthOptions);

    return next();
  };
}

const assetRoot = process.env.ASSET_ROOT ?? "./../client/dist/";

const staticAssets = serveStatic({
  root: assetRoot,
});

const app =
  new Hono()
  .use(useSession({
    duration: {
      absolute: 60 * 60 * 24 * 7
    }
  }))
    .use(await createBinder())
    .get("/", staticAssets)
    .get("/queue/:id", serveStatic({ path: join(assetRoot, "./index.html") }))
    .get("/assets/*", staticAssets)
    .route("/a", MiAuthController)
    .route("/q", QueueController);

export default app;
