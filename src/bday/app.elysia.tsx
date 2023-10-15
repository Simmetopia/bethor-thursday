import Elysia, { t } from "elysia";
import { burger_day, burger_day_user, dbUser } from "../db/schema";
import { db } from "../db";
import { middleware } from "../middleware";
import { OrderLine, OrderLineResponsible, OrderLineResponsibleProps } from ".";
import { and, eq, gte, lte } from "drizzle-orm";
import { OrderAccumulator } from "../components/order_accumulator";


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
    const special_orders = Array.isArray(body.special_order)
      ? body.special_order.sort().join(", ")
      : body.special_order
    // find todays burger burger_day
    const twoday = await TwodayBurger()
    if (!twoday) return <div> no burger day </div>

    const bday = await db
      .insert(burger_day_user)
      .values({ user_id: user!.userId, burger_day_id: Number(body.burgerDayId), special_orders })
      .returning()
    const has = bday[0]
    const is_owner = twoday.user_id === user!.userId;
    console.log(is_owner)

    const fullUser = await db.query.dbUser.findFirst({
      where: eq(dbUser.id, has.user_id)
    }) ?? null
    return is_owner ? (
      <OrderLineResponsible order={{ ...has, user: fullUser }} />
    ) : (
      <OrderLine {...has} />
    )
  },
    {
      body: t.Object({
        burgerDayId: t.String(),
        special_order: t.Union([t.Array(t.String()), t.String()])
      })
    })
  .post("/payed", async ({ body }) => {
    console.log(Number(body.burgerDayId))
    try {
      const order_line = await db
        .update(burger_day_user)
        .set({ payed: true })
        .where(
          eq(burger_day_user.id, Number(body.burgerDayId)),
        ).returning()

      const firstorder: OrderLineResponsibleProps["order"] = { ...order_line[0], user: null }

      firstorder.user = await db.query.dbUser.findFirst({
        where: eq(dbUser.id, firstorder.user_id)
      }) ?? null

      return (
        <OrderLineResponsible order={firstorder} />
      )
    } catch (e) {
      return <div> error </div>
    }
  },
    {
      body: t.Object({
        burgerDayId: t.String()
      })
    }
  )
  .get("accumulate", async ({ set, user }) => {
    const twodayBurger = await TwodayBurger()
    if (!twodayBurger) return <div> no burger day </div>

    return OrderAccumulator({ burgerDayId: twodayBurger.id })
  })


export async function TwodayBurger() {
  // Get the current date and set the time to 00:00:00
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  // Get the current date and set the time to 23:59:59
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Convert these to Unix timestamps (in seconds)
  const startTimestamp = Math.floor(startOfDay.getTime() / 1000);
  const endTimestamp = Math.floor(endOfDay.getTime() / 1000);

  // Use these timestamps in your query
  return db.query.burger_day.findFirst({
    where: and(
      gte(burger_day.day, startTimestamp),
      lte(burger_day.day, endTimestamp)
    )

  });
}
