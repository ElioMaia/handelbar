// Types matching the FastAPI backend contract

export type Meal = {
  id: number;
  title: string;
  description: string;
  price: number;
  is_vegan: boolean;
  is_vegetarian: boolean;
};

export type MyOrder = {
  meal_id: number;
  quantity: number;
};

export type MealsTodayResponse = {
  date: string; // "YYYY-MM-DD"
  deadline_passed: boolean;
  deadline: string; // ISO 8601 with TZ
  meals: Meal[];
  my_orders: MyOrder[];
};

export type BatchOrderItem = {
  meal_id: number;
  quantity: number;
};

export type BatchOrderRequest = {
  orders: BatchOrderItem[];
};

export type BatchOrderResponse = {
  status: "ok";
};

export type OrdersTodayResponse = {
  orders: MyOrder[];
};

export type Me = {
  name: string;
};

// Admin
export type AdminMealInput = {
  title: string;
  description: string;
  price: number;
  is_vegan: boolean;
  is_vegetarian: boolean;
};

export type AdminMealsRequest = {
  date: string;
  meals: AdminMealInput[];
};

export type AdminMealsGetResponse = {
  date: string;
  deadline: string;
  meals: Meal[];
};

export type AdminOrdersResponse = {
  date: string;
  orders: {
    name: string;
    meal_title: string;
    quantity: number;
  }[];
};

export type ApiError = {
  status: number;
  message: string;
};
