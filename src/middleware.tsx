import { html } from "@elysiajs/html"
import Elysia from "elysia"
import { lucia_auth } from "./auth/auth"
import { isThursdayMiddleware } from "./burger-day.middleware"
import { BaseHtml } from "./components/BaseHtml"

export const middleware = new Elysia()
  .use(html())
  .get("/styles.css", () => Bun.file("./tailwind-gen/styles.css"))
  .decorate("auth", lucia_auth.handleRequest)
  .derive(async (context) => {
    const ar = context.auth(context)
    const sesh = await ar.validate()
    return { user: sesh?.user ?? null }
  })
  // .onBeforeHandle(({ set }) => {
  //   if (!isThursdayMiddleware() && process.env.NODE_ENV !== "development") {
  //     return <BaseHtml> <div> Not thursdag </div> </BaseHtml>
  //   };
  // })
