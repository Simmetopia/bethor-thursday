import { Elysia, t } from "elysia";
import { PropsWithChildren } from "@kitajs/html";
import { html } from "@elysiajs/html";
import { isThursdayMiddleware } from "./burger-day.middleware";
import { index } from "./bday";
import { db } from "./db";
import { burger_day } from "./db/schema";
import { login_routes, lucia_auth } from "./auth/auth";

const app = new Elysia()
  .use(html())
  .use(login_routes)
  .decorate("auth", lucia_auth.handleRequest)
  .derive(async (context) => {
    const ar = context.auth(context)
    const sesh = await ar.validate()
    return { user: sesh?.user ?? null }
  })
  .onBeforeHandle(async (context) => {
    if (!context.user && context.path !== "/login") {
      context.set.redirect = "/login"
    }
  })
  .onBeforeHandle(({ set }) => {
    if (!isThursdayMiddleware() && process.env.NODE_ENV !== "development") {
      set.status = 404
      return <BaseHtml> <div> Not thursdag </div> </BaseHtml>
    };
  })
  .get("/login", async ({ set }) => {
    return <BaseHtml>
      <div>
        <a href="/login/google">Login with google</a>
      </div>
    </BaseHtml>
  })
  .get("/", async (context) => {

    return index(context.user!)

  })
  .post("/create-daily", async ({ set, body }) => {
    try {
      await db
        .insert(burger_day)
        .values({ user_id: body.userId, day: Math.floor(Date.now() / 1000) })

      set.redirect = "/"
    } catch (e) {
      console.log(e)
      set.status = 500
    }
  }, {
    body: t.Object({
      userId: t.String()
    })
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
      <body class="grid bg-slate-800 text-slate-100 place-items-center min-h-screen">
        <div class=" rounded bg-white shadow text-black p-3">
          {children}
        </div>
      </body>
    </html >
  </>)
  ;

