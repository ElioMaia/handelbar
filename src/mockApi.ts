// In-memory mock of the backend API, in case VITE_USE_MOCK=1 is set.
// Useful to run the frontend without the FastAPI backend available.

import type {
  Me,
  MealsTodayResponse,
  BatchOrderRequest,
  BatchOrderResponse,
  OrdersTodayResponse,
  AdminMealsRequest,
  AdminMealsGetResponse,
  AdminOrdersResponse,
  MyOrder,
  Meal,
} from "./types";

const today = new Date();
const pad = (n: number) => String(n).padStart(2, "0");
const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
const deadlineIso = `${todayStr}T09:00:00+02:00`;

let meals: Meal[] = [
  { id: 1, title: "Pasta Arrabbiata", description: "Scharfe Tomatensauce mit Penne", price: 8.5, is_vegan: true, is_vegetarian: true },
  { id: 2, title: "Hähnchen Curry", description: "Mit Reis", price: 9.2, is_vegan: false, is_vegetarian: false },
  { id: 3, title: "Gemüseauflauf", description: "Mit Käse überbacken", price: 8.9, is_vegan: false, is_vegetarian: true },
];

let myOrders: MyOrder[] = [
  { meal_id: 1, quantity: 2 },
  { meal_id: 3, quantity: 1 },
];

const otherUsersOrders = [
  { name: "Erika Beispiel", meal_id: 2, quantity: 1 },
  { name: "Jonas Weber", meal_id: 1, quantity: 1 },
  { name: "Noa Schmidt", meal_id: 3, quantity: 2 },
];

const me: Me = { name: "Max Mustermann" };

const delay = <T>(v: T, ms = 180) => new Promise<T>((r) => setTimeout(() => r(v), ms));

export const mockApi = {
  getMe: (): Promise<Me> => delay(me),

  getMealsToday: (): Promise<MealsTodayResponse> =>
    delay({
      date: todayStr,
      deadline_passed: false,
      deadline: deadlineIso,
      meals,
      my_orders: myOrders,
    }),

  postOrdersBatch: (body: BatchOrderRequest): Promise<BatchOrderResponse> => {
    for (const { meal_id, quantity } of body.orders) {
      const existing = myOrders.find((o) => o.meal_id === meal_id);
      if (quantity > 0) {
        if (existing) existing.quantity = quantity;
        else myOrders.push({ meal_id, quantity });
      } else if (existing) {
        myOrders = myOrders.filter((o) => o.meal_id !== meal_id);
      }
    }
    return delay({ status: "ok" as const });
  },

  getOrdersToday: (): Promise<OrdersTodayResponse> => delay({ orders: myOrders }),

  postAdminMeals: (body: AdminMealsRequest): Promise<{ status: string }> => {
    meals = body.meals.map((m, i) => ({ id: i + 1, ...m }));
    return delay({ status: "created" });
  },

  getAdminMeals: (_date: string): Promise<AdminMealsGetResponse> =>
    delay({ date: todayStr, deadline: deadlineIso, meals }),

  getAdminOrders: (_date: string): Promise<AdminOrdersResponse> => {
    const rows = [
      ...myOrders.map((o) => ({
        name: me.name,
        meal_title: meals.find((m) => m.id === o.meal_id)?.title ?? "?",
        quantity: o.quantity,
      })),
      ...otherUsersOrders.map((o) => ({
        name: o.name,
        meal_title: meals.find((m) => m.id === o.meal_id)?.title ?? "?",
        quantity: o.quantity,
      })),
    ];
    return delay({ date: todayStr, orders: rows });
  },
};
