import {PropsWithChildren} from "@kitajs/html";
import {db} from "../db";
import {burger_day_user, dbUser, Order} from "../db/schema";
import {eq} from "drizzle-orm";
import {count, countBy, filter, groupBy, join, map, mapObjIndexed, pipe, split, tap} from "ramda";
import {BaseHtml} from "./BaseHtml";
import {options} from "../bday/app.elysia.tsx";

export type OrderAccumulatorProps = {
  burgerDayId: number
}
export async function OrderAccumulator(props: PropsWithChildren<OrderAccumulatorProps>) {
  const orders = await db.query.burger_day_user.findMany({
    where: eq(burger_day_user.burger_day_id, props.burgerDayId),
  })

  const order  = pipe(
    groupBy<Order>((order) => order.special_orders!),
    mapObjIndexed((value, key, _obj) => {
      const data = pipe(
          split(","),
          filter<string>(x => x.indexOf("mayo") === -1),
          join(', ')
      )(key)

      return [value?.length || 0, data]
    }))

  const nonPayed = pipe(
    filter<Order>((order) => !order.payed),
    map(async (order) => `${getRandomPlebName()} <span safe class="font-bold">${(await db.query.dbUser.findFirst({
      where: eq(dbUser.id, order.user_id)
    }))?.givenName
      }</span> has not payed yet`),
  )


  const ordersT = order(orders)

  const mpda = await Promise.all(nonPayed(orders))
  const amount_of_garlic_mayos = pipe(
      map<Order, string >((order) => order.special_orders || ""),
      count<string>((order) => {
        const thing =  order.indexOf("hvidløgsmayo") !== -1
        return thing
      })
  )(orders)
  const amount_of_chilies = orders.length - amount_of_garlic_mayos;


  return (
    <BaseHtml>
      <div class="rounded-xl border-slate-300 border-6 p-3">
        {ordersT && Object.keys(ordersT).map((key) => {
          const [first, second] = ordersT[key] ?? [0, ""]
          return (
            <p>
              {first} {second}
            </p>
          )
        })
        }
        <h4 class="text-2xl mt-4"> Number of garlic MAYOS = {amount_of_garlic_mayos} </h4>
        <h4 class="text-2xl mt-4"> Number of chiliBoiz = {amount_of_chilies} </h4>
        <h4 class="text-2xl mt-4"> Non paying plebs </h4>
        <div class="">
          {mpda.map((order) => {
            return (
              <p >  {order}  </p>
            )
          })}
        </div>
      </div>
    </BaseHtml>

  )

}

// give me a list of 30 names like pleb, or megapleb, peasent, etc
// and a function that returns a random one of them
export const getRandomPlebName = () => {
  const negativeNames = [
    "BurgerBum",
    "LunchLoser",
    "PattyPincher",
    "MealMoocher",
    "CheeseburgerCheapskate",
    "BurgerBandit",
    "GrubGrabber",
    "BunBandit",
    "FryFilcher",
    "Dine-and-DashDan",
    "CondimentKlepto",
    "SodaSwindler",
    "BurgerBlunderer",
    "Bite-and-BoltBenny",
    "CashlessCarnivore",
    "BurgerBoor",
    "CheeseburgerChiseler",
    "HungryHooligan",
    "No-PayNed",
    "MealMarauder",
    "BurgerBurglar",
    "TableTaker",
    "OrderSkipper",
    "BillDodger",
    "GrillGhost",
    "FeastFugitive",
    "PattyPirate",
    "BurgerBandito",
    "Dine-OutDelinquent",
    "LunchLewdster",
    "BurgerBypasser",
    "CulinaryCriminal",
    "PattyPilferer",
    "HungryHijacker",
    "No-CashNell",
    "SnackScofflaw",
    "Bite-and-BoltBella",
    "TabThief",
    "BurgerMugger",
    "TableTroublemaker",
    "BillBypasser",
    "GrillGrafter",
    "FeastFelony",
    "PattyPlunderer",
    "BurgerBrigand",
    "Dine-OutDelinquent",
    "LunchLootist",
    "BurgerBanditette",
    "CulinaryCon",
    "PattyPirateess",
    "HungryHijackerette",
    "No-CashNina",
    "SnackScofflawette"
  ];

  const randomIndex = Math.floor(Math.random() * negativeNames.length);
  const randomName = negativeNames[randomIndex];
  return randomName;
}

