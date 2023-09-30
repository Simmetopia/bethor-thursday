/// <reference types="@kitajs/html/htmx.d.ts" />
import '@kitajs/html/register';

import { db } from "../db"
import { BaseHtml } from "..";
import { User } from 'lucia';
import { Button } from '../components/button';


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


export async function index(user: User) {
  const burgerDay = await bday()
  return (
    <BaseHtml>
      <Header fname={user?.given_name ?? ""} lname={user?.family_name ?? ""} />
      {burgerDay ? <div> Yes, you can order </div> : <NoBurger userid={user?.userId} />}
    </BaseHtml>)
}

const Header = ({ fname, lname }: { fname: string, lname: string }) => (
  <h1 class="font-bold text-3xl text-blue-400 pb-8">
    Welcome {fname} {lname}
  </h1>)


const NoBurger = (props: { userid: string }) => (
  <div class="flex flex-col gap-3">
    <p class="italic text-blue-400 font-lg"> No burger day created yet</p>
    <form>
      <input type="hidden" name="userId" value={props.userid} />
      <Button hx-post="/create-daily" > Let me be the one to do it today! (You will order and pickup)</Button>
    </form>
  </div >
)

