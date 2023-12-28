import Elysia, { t } from "elysia";
import { burger_day, burger_day_user, dbUser } from "../db/schema";
import { db } from "../db";
import { middleware } from "../middleware";
import { OrderLineResponsible, OrderLineResponsibleProps } from ".";
import { and, eq, gte, lte } from "drizzle-orm";
import { OrderAccumulator } from "../components/order_accumulator";
import { append_order, append_order_schema } from "./append_order.tsx";


export enum options {
  glutenfri = "glutenfri",
  ingen_salat = "ingen salat",
  ingen_bacon = "ingen bacon",
  hvidløgsmayo = "hvidløgsmayo",
  uden_ost = "uden_ost",
}

const options_list = Object.values(options)

export const bday_elysia = new Elysia()
  .use(middleware)
  .post("/create-daily", async ({ set, body }) => {
    try {
      const twoday = await TwodayBurger();
      if (twoday) {
        set.redirect = "/"
        return
      }
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
  .post("/append_order", async ({ body, user }) => append_order(body, user),
    {
      body: append_order_schema()
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
      const order = order_line[0]
      if (!order) return <div> no order </div>

      const firstorder: OrderLineResponsibleProps["order"] = { ...order, user: null }

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
  .get("accumulate", async () => {
    const twodayBurger = await TwodayBurger()
    if (!twodayBurger) return <div> no burger day </div>
    return OrderAccumulator({ burgerDayId: twodayBurger.id })
  })
  .post("/edit", async ({ set, body }) => {
    await db
      .update(burger_day)
      .set({
        telephone: body.telephone
      })
      .where(eq(burger_day.id, Number(body.burgerDayId)))

    set.status = 200
    return ["ok", "you did it"]

  },
    {
      body: t.Object({
        burgerDayId: t.String(),
        telephone: t.String(),
        price: t.Union([t.String(), t.Literal('')]),
      })
    }
  )


const coerceEmptyStringToNumber = (value: string, defaultValue: number) => {
  if (value === '') {
    return defaultValue;
  }
  return Number(value);
};




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
