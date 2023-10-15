import { PropsWithChildren } from "@kitajs/html";
import { db } from "../db";
import { Order, burger_day_user, dbUser } from "../db/schema";
import { eq } from "drizzle-orm";
import { count, filter, groupBy, map, mapObjIndexed, pipe } from "ramda";
import { BaseHtml } from "./BaseHtml";

export type OrderAccumulatorProps = {
  burgerDayId: number
}
export async function OrderAccumulator(props: PropsWithChildren<OrderAccumulatorProps>) {
  const orders = await db.query.burger_day_user.findMany({
    where: eq(burger_day_user.burger_day_id, props.burgerDayId),
  })

  const order = pipe(
    groupBy<Order>((order) => order.special_orders!),
    mapObjIndexed((value, _key, _obj) => {
      return value?.length
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


  return (
    <BaseHtml>
      <div class="rounded-xl border-slate-300 border-6 p-3">
        {ordersT && Object.keys(ordersT).map((key) => {
          return (
            <p>
              {key} : {ordersT[key]}
            </p>
          )
        })
        }
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

