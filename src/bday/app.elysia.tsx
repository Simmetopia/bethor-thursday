import Elysia, { t } from "elysia";
import { burger_day, burger_day_user, user } from "../db/schema";
import { db } from "../db";
import { middleware } from "../middleware";
import { OrderLine, OrderLineResponsible, OrderLineResponsibleProps } from ".";
import { and, eq } from "drizzle-orm";


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
  .post("/payed", async ({ body }) => {
    const order_line = await db
      .update(burger_day_user)
      .set({ payed: true })
      .where(
        and(
          eq(burger_day_user.user_id, body.userId),
          eq(burger_day_user.burger_day_id, Number(body.burgerDayId))
        )
      )
      .returning()
    const firstorder: OrderLineResponsibleProps["order"] = { ...order_line[0], user: null }

    firstorder.user = await db.query.user.findFirst({
      where: eq(user.id, firstorder.user_id)
    }) ?? null



    return (
      <OrderLineResponsible order={firstorder} />
    )
  },
    {
      body: t.Object({
        userId: t.String(),
        burgerDayId: t.String()
      })
    }
  )

