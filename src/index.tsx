import { Elysia, t } from "elysia";
import { PropsWithChildren } from "@kitajs/html";
import { html } from "@elysiajs/html";
import { isThursdayMiddleware } from "./burger-day.middleware";
import { index } from "./bday";
import { db } from "./db";
import { burger_day } from "./db/schema";

const app = new Elysia()
  .use(html())
  .onBeforeHandle(({ set }) => {
    if (!isThursdayMiddleware()) {
      set.status = 404
      return <BaseHtml> <div> Not thursdag </div> </BaseHtml>
    };
  })
  .get("/", () => index())
  .post("/create-daily", async ({ set }) => {
    await db
      .insert(burger_day)
      .values({ user_id: 42, day: new Date(Date.now()).getSeconds() })

    set.status = 301
    set.redirect = "/"

  })
  .get("/styles.css", () => Bun.file("./tailwind-gen/styles.css"))
  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);

export const BaseHtml = ({ children }: PropsWithChildren) => (
  <>
    {"<!DOCTYPE html>"}
    <html lang="en">

      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Bethorday</title>
        <script src="https://unpkg.com/htmx.org@1.9.3"></script>
        <script src="https://unpkg.com/hyperscript.org@0.9.9"></script>
        <link href="/styles.css" rel="stylesheet" />
      </head>
      <body>
        ${children}
      </body>
    </html >
  </>)
  ;

