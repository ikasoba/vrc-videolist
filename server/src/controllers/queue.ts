import { Hono } from "hono";
import { Queue, type QueueService } from "../domains/queue.ts";
import { withBearerToken, withZodBody } from "../middlewares.ts";
import { AppendURLRequest, DeleteURLRequest } from "../schemas/queue.ts";

export interface QueueControllerContext {
  Variables: {
    queues: QueueService;
  }
}

const app = new Hono<QueueControllerContext>();

app.get("/:id", async ctx => {
  const queues = ctx.get("queues");
  const result =
    await queues.get(ctx.req.param("id"));
  if (result == null) {
    ctx.status(404);
    return ctx.text("not found");
  }

  return ctx.json(result);
});

app.post("/", async ctx => {
  const queues = ctx.get("queues");

  const result =
    await queues.create();

  return ctx.json(result);
});

app.delete(
  "/:id",
  withBearerToken(),
  async ctx => {
    const queues = ctx.get("queues");
    const credential = ctx.get("bearer");

    const isOK =
      await queues.delete(
        ctx.req.param("id"),
        credential
      );

    if (isOK == false) {
      ctx.status(403);
      return ctx.text("forbidden");
    }

    return ctx.newResponse(null, 204);
  }
);

app.patch(
  "/:id/items",
  withZodBody(AppendURLRequest),
  async ctx => {
    const queues = ctx.get("queues");

    const result =
      await queues.appendURL(
        ctx.req.param("id"),
        ctx.req.valid("json")
      );

    return ctx.json(Queue.encode(result));
  }
);

app.delete(
  "/:id/items",
  withZodBody(DeleteURLRequest),
  async ctx => {
    const queues = ctx.get("queues");

    const result =
      await queues.removeURL(
        ctx.req.param("id"),
        ctx.req.valid("json")
      );

    return ctx.json(Queue.encode(result));
  }
);

app.get("/:id/curr", async ctx => {
  const queues = ctx.get("queues");

  const result =
    await queues.getCurrentURL(ctx.req.param("id"));

  if (result == null) {
    ctx.status(404);
    return ctx.text("not found");
  }

  return ctx.redirect(result);
});

app.get(
  "/:id/next",
  withBearerToken(),
  async ctx => {
    const queues = ctx.get("queues");

    const id = ctx.req.param("id");

    const result =
      await queues.incrementURLOffset(id, ctx.get("bearer"));

    if (result === false) {
      ctx.status(403);
      return ctx.text("forbidden");
    }

    return ctx.json(result);
  }
);

export default app;
