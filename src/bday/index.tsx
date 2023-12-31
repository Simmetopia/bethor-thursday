/// <reference types="@kitajs/html/htmx.d.ts" />
import '@kitajs/html/register';

import { db } from "../db"
import { User } from 'lucia';
import { Button } from '../components/button';
import { BaseHtml } from '../components/BaseHtml';
import { burger_day, burger_day_user, dbUser } from '../db/schema';
import { Checkmark } from '../icons/checkmark';


async function bday() {
  // Get the current date and set the time to midnight
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  // Create a new Date object for the end of the day
  const endDate = new Date(startDate);
  endDate.setHours(23, 59, 59, 999);

  // Convert these to epoch timestamps
  const startTimestamp = Math.floor(startDate.getTime() / 1000);
  const endTimestamp = Math.floor(endDate.getTime() / 1000);

  return db
    .query
    .burger_day.
    findFirst({
      where: (burger_day, { between }) => between(burger_day.day, startTimestamp, endTimestamp)
    })
}

const orders = async (burgerDayId: number, user_id: string) =>
  db
    .query
    .burger_day_user
    .findMany({
      where: (burger_day_user, { and, eq }) => and(
        eq(burger_day_user.burger_day_id, burgerDayId),
        eq(burger_day_user.user_id, user_id)
      )
    })


export const OrderLine = (props: { bgdayUser: typeof burger_day_user.$inferSelect, num: string | null, price?: number }) => (
  <div class="bg-slate-800 shadow rounded text-stone-100 p-3">
    {props.num && <p class="font-extrabold"> you pay to tlf: {props.num} </p>}
    {props.price && <p class="font-bold"> Special price 4 u my friend: {props.price} </p>}
    <p class="font-bold text-xl"> payment status: {props.bgdayUser.payed ? "payed" : "NO PAY YET, YOU PAY NOW"} </p>

    <p> You have ordered for burger day {props.bgdayUser.burger_day_id} </p>
    <p safe> Your special orders are: {props.bgdayUser.special_orders} </p>
  </div>)


function Summery() {
  return null;
}

export async function index(user: User) {
  const burgerDay = await bday()
  const ordesrs = burgerDay && await orders(burgerDay.id, user.userId)

  const is_owner = burgerDay?.user_id === user.userId;

  return (
    <BaseHtml>
      <div class="flex flex-row gap-3">
        <div class="flex flex-col gap-3">
          <Header fname={user?.given_name ?? ""} lname={user?.family_name ?? ""} />
          {is_owner && burgerDay ? <PhoneAndPriceEdit burgerDayId={burgerDay.id} /> : ""}
          {is_owner && burgerDay ? await <OrdersForToday burgerDayId={burgerDay.id} />
            : <div id="orders">
              {ordesrs && ordesrs.map(o => (
                <OrderLine bgdayUser={o} price={burgerDay.price} num={burgerDay.telephone} />
              ))}
            </div>}
          <div>
            {burgerDay ? <BurgerTime burgerdayId={burgerDay.id} /> : <NoBurger userid={user?.userId} />}
          </div>
        </div>
        <div>
          <Summery />
        </div>
      </div>
    </BaseHtml>)
}

const PhoneAndPriceEdit = (props: { burgerDayId: number }) => (
  <form class="flex flex-row gap-3 text-slate-800">
    <input type="hidden" name="burgerDayId" value={props.burgerDayId.toString()} />
    <label class="flex flex-col">
      <span class="text-blue-400 font-bold"> Phone number </span>
      <input type="tel" name="telephone" class="rounded shadow border-4 p-3" />
    </label>
    <label class="flex flex-col">
      <span class="text-blue-400 font-bold"> Price </span>
      <input type="number" name="price" class="rounded shadow border-4 p-3" />
    </label>
    <Button hx-post="/edit"> Edit </Button>
  </form>
)

const Header = ({ fname, lname }: { fname: string, lname: string }) => (
  <h1 safe class="font-bold text-3xl text-blue-400 pb-8">
    Welcome {fname} {lname}
  </h1>)

const BurgerTime = (props: { burgerdayId: number }) => {
  return (
    <form class="rounded shadow border-4 p-3 flex flex-row items-center justify-between">
      <input type="hidden" name="burgerDayId" value={props.burgerdayId.toString()} />
      <select class="text-slate-700" name="special_order" multiple="true" >
        <option value="glutenfri">Glutenfri</option>
        <option value="ingen_salat">Uden salat</option>
        <option value="ingen_bacon">Uden bacon</option>
        <option value="hvidløgsmayo">Hvidløgsmayo</option>
        <option value="uden_ost">Uden ost</option>
        <option selected="true" value="chilimayo">chilimayo</option>
      </select>
      <Button hx-post="/append_order" hx-target="#orders" hx-swap="beforeend"> Gimme burg today! </Button>
    </form>
  )
}

const NoBurger = (props: { userid: string }) => (
  <div class="flex flex-col gap-3">
    <p class="italic text-blue-400 font-lg"> No burger day created yet</p>
    <form action="/create-daily" method="post">
      <input type="hidden" name="userId" value={props.userid} />
      <Button > Let me be the one to do it today! (You will order and pickup)</Button>
    </form>
  </div >
)

export type OrderLineResponsibleProps = {
  order: typeof burger_day_user.$inferSelect & { user: typeof dbUser.$inferSelect | null }
}

const RenderName = (props: { user: typeof dbUser.$inferSelect | null }) => {
  if (props.user === null) {
    return <span class="text-red-500"> User not found </span>
  }
  return <span safe> {props.user.givenName} {props.user.familyName} </span>
}

export const OrderLineResponsible = ({ order }: OrderLineResponsibleProps) => (
  <div
    _="init set (innerHTML of #order_amount) to #orders.children.length"
    class="flex flex-row gap-3 border shadow p-2 rounded"
    id={`order_line-${order.id}`}>
    <div class="flex flex-col gap-1">
      <p> <RenderName user={order.user} /> has ordered for burger day {order.burger_day_id} </p>
      <p> <RenderTags tag={order.special_orders} /> </p>
    </div>
    {order.payed ?
      <span class="rounded-full px-3 py-1  text-green-600 items-center justify-center flex font-extrabold"> <Checkmark /> </span>
      : <form >
        <input type="hidden" name="burgerDayId" value={order.id.toString()} />

        <Button hx-post="/payed" hx-target={`#order_line-${order.id}`} hx-swap="outerHTML" > register payment </Button>
      </form>}
  </div>)


const OrdersForToday = async (props: { burgerDayId: number }) => {
  const orders = await db.query.burger_day_user.findMany({
    where: (burger_day_user, { eq }) => eq(burger_day_user.burger_day_id, props.burgerDayId),
    with: { user: true }
  })

  return (
    <div class="flex flex-col gap-3">
      You are today's burger day owner. You can see the orders below.
      <span id="order_amount" class="rounded-full px-3 py-1 bg-blue-800 text-white font-bold"> 0 </span><span> orders today </span>
      <div id="orders" class="flex flex-col gap-3 ">
        {
          orders.map(o => <OrderLineResponsible order={o} />)
        }
      </div>
    </div>)
}


const RenderTags = (props: { tag: string | null }) => {
  if (props.tag === null) {
    return ""
  }
  const tags = props.tag.split(", ")
  return (
    <div class="flex flex-row gap-1">
      {
        tags.map(t => <span class="rounded-full px-3 py-1 border  border-slate-100 text-white font-bold"> {tag_to_emoji(t)} </span>)
      }
    </div>)
}

const tag_to_emoji = (tag: string) => {
  switch (tag) {
    case "glutenfri": return "❌🌾"
    case "ingen_salat": return "❌🥗"
    case "ingen_bacon": return "❌🥓"
    case "ingen_bacon": return "❌🧀"
    case "hvidløgsmayo": return "🧄"
    case "chilimayo": return "🌶️"
    default: return ""
  }
}
