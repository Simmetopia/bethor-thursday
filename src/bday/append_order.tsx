import {db} from "../db";
import {burger_day_user, dbUser} from "../db/schema.ts";
import {eq} from "drizzle-orm";
import {OrderLine, OrderLineResponsible} from "./index.tsx";
import {TwodayBurger} from "./app.elysia.tsx";
import {Static, t} from "elysia";

export function append_order_schema() {
    return t.Object({
        burgerDayId: t.String(),
        special_order: t.Union([t.Array(t.String()), t.String()])
    });
}

export async function append_order(body: Static<ReturnType<typeof append_order_schema>>, user:  any) {
    const special_orders = Array.isArray(body.special_order)
        ? body.special_order.sort().join(", ")
        : body.special_order
    // find todays burger burger_day
    const twoday = await TwodayBurger()
    if (!twoday) return <div> no burger day </div>

    const bday = await db
        .insert(burger_day_user)
        .values({user_id: user!.userId, burger_day_id: Number(body.burgerDayId), special_orders})
        .returning()
    const has = bday[0]
    if (!has) return <div> sometin wong </div>

    const is_owner = twoday.user_id === user!.userId;
    console.log(is_owner)

    const fullUser = await db.query.dbUser.findFirst({
        where: eq(dbUser.id, has.user_id)
    }) ?? null
    return is_owner ? (
        <OrderLineResponsible order={{...has, user: fullUser}}/>
    ) : (
        <OrderLine {...has} />
    )
}
