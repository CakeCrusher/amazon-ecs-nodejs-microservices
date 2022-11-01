const Koa = require("koa");
const router = require("koa-router")();
const axios = require("axios");

const app = new Koa();

app.use(function* (next) {
  const start = new Date();
  yield next;
  const ms = new Date() - start;
  console.log("%s %s - %s", this.method, this.url, ms);
});

router.get("/api/mix", async (ctx) => {
  let posts = await axios.get("<LB_DNS>/api/posts");
  posts = posts.data;
  let threads = await axios.get("<LB_DNS>/api/threads");
  threads = threads.data;
  posts.forEach((p) => {
    const threadFound = threads.find((t) => t.id === p.thread);
    if (threadFound["posts"]) {
      threadFound["posts"].push(p);
    } else {
      threadFound["posts"] = [p];
    }
  });
  console.log(threads);
  ctx.body = threads;
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000);

console.log("Worker started");
