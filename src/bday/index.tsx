/// <reference types="@kitajs/html/htmx.d.ts" />
import '@kitajs/html/register';

import { db } from "../db"
import { User } from 'lucia';
import { Button } from '../components/button';
import { BaseHtml } from '../components/BaseHtml';
import { burger_day_user } from '../db/schema';


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


export const OrderLine = (props: typeof burger_day_user.$inferSelect) => (
  <div class="bg-slate-800 shadow rounded text-stone-100 p-3">
    <p> You have ordered for burger day {props.burger_day_id} </p>
    <p> Your special orders are: {props.special_orders} </p>
    <p> payment status: {props.payed ? "payed" : "NO PAY YET, YOU PAY NOW"} </p>
  </div>)


export async function index(user: User) {
  const burgerDay = await bday()

  const ordesrs = burgerDay && await orders(burgerDay.id, user.userId)
  return (
    <BaseHtml>
      <div class="flex flex-col gap-3">
        <Header fname={user?.given_name ?? ""} lname={user?.family_name ?? ""} />
        <div id="orders">
          {ordesrs && ordesrs.map(o => (
            <OrderLine {...o} />
          ))}
        </div>
        <div>
          {burgerDay ? <BurgerTime burgerdayId={burgerDay.id} /> : <NoBurger userid={user?.userId} />}
        </div>
      </div>
    </BaseHtml>)
}

const Header = ({ fname, lname }: { fname: string, lname: string }) => (
  <h1 class="font-bold text-3xl text-blue-400 pb-8">
    Welcome {fname} {lname}
  </h1>)

const BurgerTime = (props: { burgerdayId: number }) => {
  return (
    <form>
      <input type="hidden" name="burgerDayId" value={props.burgerdayId.toString()} />
      <select name="special_order" multiple="true">
        <option value="glutenfri">Glutenfri</option>
        <option value="ingen_salat">Uden salat</option>
        <option value="ingen_bacon">Uden bacon</option>
        <option value="hvidløgsmayo">Hvidløgsmayo</option>
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

