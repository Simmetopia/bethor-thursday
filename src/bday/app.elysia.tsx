import Elysia, { t } from "elysia";
import { burger_day, burger_day_user } from "../db/schema";
import { db } from "../db";
import { middleware } from "../middleware";
import { OrderLine } from ".";


enum options {
  glutenfri = "glutenfri",
  ingen_salat = "ingen salat",
  ingen_bacon = "ingen bacon",
  hvidløgsmayo = "hvidløgsmayo"
}
const options_list = Object.values(options)
export const bday_elysia = new Elysia()
  .use(middleware)
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
  .post("/append_order", async ({ body, user }) => {

    const special_orders = body.special_order.join(", ")
    const bday = await db
      .insert(burger_day_user)
      .values({ user_id: user!.userId, burger_day_id: Number(body.burgerDayId), special_orders })
      .returning()

    const has = bday[0]

    return (
      <OrderLine {...has} />
    )


  },
    {
      body: t.Object({
        burgerDayId: t.String(),
        special_order: t.Array(t.String())
      })
    })

