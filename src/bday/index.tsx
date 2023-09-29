/// <reference types="@kitajs/html/htmx.d.ts" />
import '@kitajs/html/register';

import { db } from "../db"
import { BaseHtml } from "..";


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


export async function index() {
  const burgerDay = await bday()

  return (<BaseHtml>

    {burgerDay ? <div> Yes, you can order </div> : <NoBurger />}
  </BaseHtml>)
}


const NoBurger = () => (
  <div>
    No burger day created yet
    <button hx-post="/create-daily"> create one? you will dedicate yourself to ordering and paying </button>
  </div >
)

