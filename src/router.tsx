import Elysia from "elysia"
import { login_routes, lucia_auth } from "./auth/auth"
import { index } from "./bday"
import { bday_elysia } from "./bday/app.elysia"
import { BaseHtml } from "./components/BaseHtml"
import { middleware } from "./middleware"


export const app = new Elysia()
  .use(middleware)
  .get("/login", async () =>
    <BaseHtml>
      <div>
        <a href="/login/google">Login with google</a>
      </div>
    </BaseHtml>)
  .get("/", async (context) => {
    return index(context.user!)
  })
  .use(login_routes)
  .use(bday_elysia)
