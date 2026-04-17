import { useEffect, useState } from "react";
import { api } from "../api";
import type { MealsTodayResponse } from "../types";

// History view — mocked locally for now, since the spec doesn't define
// a user-facing history endpoint yet. The recent list below comes
// from today's /meals/today response; older entries are placeholders.

export function HistoryPage() {
  const [today, setToday] = useState<MealsTodayResponse | null>(null);

  useEffect(() => {
    api.getMealsToday().then(setToday).catch(() => {});
  }, []);

  const todaysEntries =
    today?.my_orders.map((o) => {
      const meal = today.meals.find((m) => m.id === o.meal_id);
      return {
        date: today.date,
        title: meal?.title ?? "Unknown",
        sub: `×${o.quantity}`,
        price: meal ? `€${(meal.price * o.quantity).toFixed(2)}` : "",
        status: "upcoming" as const,
      };
    }) ?? [];

  const past = [
    { date: "2026-04-16", title: "Cod with romesco, greens", sub: "Fish · ×1", price: "€9.20", status: "served" as const },
    { date: "2026-04-15", title: "Aubergine parmigiana", sub: "Vegetarian · ×1", price: "€6.50", status: "served" as const },
    { date: "2026-04-14", title: "Coq au vin, buttered mash", sub: "Meat · ×1", price: "€8.90", status: "served" as const },
    { date: "2026-04-10", title: "—", sub: "No order placed before 09:00", price: "", status: "missed" as const },
    { date: "2026-04-09", title: "Fish pie, peas, mash crust", sub: "Fish · ×1", price: "€8.50", status: "served" as const },
  ];

  const rows = [...todaysEntries, ...past];

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-sub">SINCE JANUARY 2026</div>
          <h1 className="page-title">My orders</h1>
        </div>
      </div>

      <div className="section-head">
        <h2>Recent</h2>
        <span className="kicker">{rows.length} entries</span>
      </div>

      <div className="history-list">
        {rows.map((h, i) => (
          <div key={i} className="history-row">
            <div className="h-date">{formatDate(h.date)}</div>
            <div className="h-photo" />
            <div>
              <div className="h-title">{h.title}</div>
              <div className="h-sub">{h.sub}</div>
            </div>
            <div className="h-price">{h.price}</div>
            <div className={`h-status ${h.status}`}>{h.status}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function formatDate(ymd: string): string {
  try {
    const d = new Date(ymd);
    return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  } catch {
    return ymd;
  }
}
