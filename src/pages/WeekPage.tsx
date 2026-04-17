import { useEffect, useState } from "react";
import { api } from "../api";
import type { MealsTodayResponse } from "../types";

// Week view is informational / read-only for now — the backend spec
// currently exposes only today's meals. In production you'd add a
// GET /meals/week endpoint; here we show today + placeholder days.

export function WeekPage() {
  const [today, setToday] = useState<MealsTodayResponse | null>(null);

  useEffect(() => {
    api.getMealsToday().then(setToday).catch(() => {});
  }, []);

  const days = buildWeek(today);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-sub">WEEK AT A GLANCE</div>
          <h1 className="page-title">This week</h1>
        </div>
        <div className="page-meta">
          <button className="btn ghost sm" disabled>← Prev week</button>
          <button className="btn ghost sm" disabled>Next week →</button>
        </div>
      </div>

      <div className="stats-strip">
        <Stat label="Your orders" value={String(today?.my_orders.length ?? 0)} sub="for today" />
        <Stat label="Dishes today" value={String(today?.meals.length ?? 0)} sub="3 every weekday" />
        <Stat
          label="Deadline"
          value={today ? new Date(today.deadline).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "—"}
          sub="Europe/Berlin"
        />
        <Stat label="Week" value="W16" sub="2026" />
      </div>

      <div className="week-grid">
        {days.map((d, i) => (
          <div key={i} className={`week-day ${d.today ? "today" : ""}`}>
            <div className="week-day-head">
              <div>
                <div className="week-day-name">{d.name}</div>
                <div className="week-day-date">{d.dateStr}</div>
              </div>
              {d.today && <span className="week-today-pill">Today</span>}
              {d.past && <span className="week-day-date">— past</span>}
            </div>
            {d.meals.map((m, j) => (
              <div key={j} className={`week-meal ${m.ordered ? "ordered" : ""}`}>
                <span className="week-meal-tag">{m.tag}{m.ordered ? ` · ×${m.qty}` : ""}</span>
                <span className="week-meal-title">{m.title}</span>
                <span className="week-meal-count">
                  {d.today ? (m.ordered ? "in your order" : "available") : d.past ? "served" : "opens 16:00 prior"}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  );
}

type WeekDay = {
  name: string;
  dateStr: string;
  today?: boolean;
  past?: boolean;
  meals: { tag: string; title: string; ordered: boolean; qty: number }[];
};

function buildWeek(today: MealsTodayResponse | null): WeekDay[] {
  const names = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const now = today ? new Date(today.date) : new Date();
  const dayIdx = (now.getDay() + 6) % 7; // 0 = Mon
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayIdx);

  const placeholders: WeekDay["meals"] = [
    { tag: "VEG", title: "—", ordered: false, qty: 0 },
    { tag: "MEAT", title: "—", ordered: false, qty: 0 },
    { tag: "FISH", title: "—", ordered: false, qty: 0 },
  ];

  return names.map((name, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    const isToday = today ? d.toISOString().slice(0, 10) === today.date : i === dayIdx;
    const past = i < dayIdx;

    let meals = placeholders;
    if (isToday && today) {
      meals = today.meals.map((m) => {
        const ord = today.my_orders.find((o) => o.meal_id === m.id);
        return {
          tag: m.is_vegan ? "VEGAN" : m.is_vegetarian ? "VEG" : "MEAT",
          title: m.title,
          ordered: !!ord && ord.quantity > 0,
          qty: ord?.quantity ?? 0,
        };
      });
    }

    return { name, dateStr, today: isToday, past, meals };
  });
}
