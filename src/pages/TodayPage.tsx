import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import type { Meal, MealsTodayResponse, MyOrder } from "../types";
import { Countdown, QtyStepper, ViewToggle } from "../components/Controls";
import { Icon } from "../components/Icon";

type View = "card" | "list";
type Qty = Record<number, number>;

function toQty(orders: MyOrder[]): Qty {
  const q: Qty = {};
  for (const o of orders) q[o.meal_id] = o.quantity;
  return q;
}

function formatDeadline(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "09:00";
  }
}

function formatDate(ymd: string): string {
  try {
    const d = new Date(ymd);
    return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  } catch {
    return ymd;
  }
}

function tagFor(m: Meal): { label: string; cls: string } {
  if (m.is_vegan) return { label: "VEGAN", cls: "veg" };
  if (m.is_vegetarian) return { label: "VEGETARIAN", cls: "veg" };
  return { label: "MEAT / FISH", cls: "meat" };
}

function diff(original: Qty, current: Qty, mealIds: number[]): { meal_id: number; quantity: number }[] {
  const out: { meal_id: number; quantity: number }[] = [];
  for (const id of mealIds) {
    const was = original[id] ?? 0;
    const now = current[id] ?? 0;
    if (was !== now) out.push({ meal_id: id, quantity: now });
  }
  return out;
}

type Props = { view: View; setView: (v: View) => void };

export function TodayPage({ view, setView }: Props) {
  const [data, setData] = useState<MealsTodayResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState<Qty>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<"idle" | "ok" | "err">("idle");

  useEffect(() => {
    let alive = true;
    api.getMealsToday()
      .then((res) => {
        if (!alive) return;
        setData(res);
        setQty(toQty(res.my_orders));
      })
      .catch((e) => alive && setError(e?.message ?? "Failed to load menu"));
    return () => { alive = false; };
  }, []);

  const original = useMemo(() => (data ? toQty(data.my_orders) : {}), [data]);
  const mealIds = useMemo(() => data?.meals.map((m) => m.id) ?? [], [data]);
  const changes = useMemo(() => diff(original, qty, mealIds), [original, qty, mealIds]);
  const hasChanges = changes.length > 0;
  const locked = data?.deadline_passed ?? false;

  const total = useMemo(() => {
    if (!data) return 0;
    return data.meals.reduce((sum, m) => sum + m.price * (qty[m.id] ?? 0), 0);
  }, [data, qty]);

  const save = async () => {
    if (!data) return;
    setSaving(true);
    setSaved("idle");
    try {
      const body = { orders: data.meals.map((m) => ({ meal_id: m.id, quantity: qty[m.id] ?? 0 })) };
      await api.postOrdersBatch(body);
      setSaved("ok");
      // Refresh to get the server's view of the orders
      const fresh = await api.getMealsToday();
      setData(fresh);
      setQty(toQty(fresh.my_orders));
    } catch (e: any) {
      setSaved("err");
      setError(e?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const reset = () => setQty(original);

  if (error && !data) return <div className="empty"><div className="big">Couldn't load today's menu</div><div>{error}</div></div>;
  if (!data) return <div className="empty"><div className="big">Loading…</div></div>;

  const anyOrdered = Object.values(qty).some((q) => q > 0);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-sub">{formatDate(data.date)} · LUNCH 12:00 — 14:00</div>
          <h1 className="page-title">Today's menu</h1>
        </div>
        <div className="page-meta">
          <Countdown locked={locked} deadlineText={formatDeadline(data.deadline)} />
          <ViewToggle view={view} setView={setView} />
        </div>
      </div>

      {saved === "ok" && !hasChanges && anyOrdered && (
        <div className="confirmed-banner">
          <div className="check"><Icon name="check" size={14} /></div>
          <div className="cb-main">
            <b>Order saved.</b>
            <p>Pick up between 12:00 and 14:00 at the counter. You can change your order until {formatDeadline(data.deadline)}.</p>
          </div>
        </div>
      )}

      {locked && (
        <div className="confirmed-banner" style={{ borderLeftColor: "var(--ink-4)" }}>
          <div className="check" style={{ background: "var(--ink-4)" }}>
            <Icon name="x" size={14} />
          </div>
          <div className="cb-main">
            <b>Order window closed.</b>
            <p>The {formatDeadline(data.deadline)} cut-off has passed. See you tomorrow.</p>
          </div>
        </div>
      )}

      {view === "card" ? (
        <div className="meals-grid">
          {data.meals.map((m) => (
            <MealCard
              key={m.id}
              meal={m}
              qty={qty[m.id] ?? 0}
              onChange={(v) => setQty({ ...qty, [m.id]: v })}
              locked={locked}
            />
          ))}
        </div>
      ) : (
        <div className="meals-list">
          {data.meals.map((m) => (
            <MealRow
              key={m.id}
              meal={m}
              qty={qty[m.id] ?? 0}
              onChange={(v) => setQty({ ...qty, [m.id]: v })}
              locked={locked}
            />
          ))}
        </div>
      )}

      {hasChanges && !locked && (
        <div className="confirm-bar">
          <div className="cb-text">
            <b>{changes.length}</b> change{changes.length === 1 ? "" : "s"} ·
            total <b>€{total.toFixed(2)}</b>
          </div>
          <button className="btn ghost sm" onClick={reset} disabled={saving}>Discard</button>
          <button className="btn accent sm" onClick={save} disabled={saving}>
            {saving ? "Saving…" : <><Icon name="check" size={13} /> Save order</>}
          </button>
        </div>
      )}
    </>
  );
}

function MealCard({ meal, qty, onChange, locked }: { meal: Meal; qty: number; onChange: (v: number) => void; locked: boolean }) {
  const tag = tagFor(meal);
  return (
    <div className={`meal-card ${qty > 0 ? "selected" : ""} ${locked ? "locked" : ""}`}>
      <div className="meal-photo">
        <span className={`meal-tag ${tag.cls}`}>{tag.label}</span>
        <span className="label">meal photo</span>
      </div>
      <div className="meal-body">
        <div className="meal-top">
          <h3 className="meal-title">{meal.title}</h3>
          <span className="meal-price">€{meal.price.toFixed(2)}</span>
        </div>
        <p className="meal-desc">{meal.description}</p>
      </div>
      <div className="meal-foot">
        <div className="order-count">
          {qty > 0 ? <span><b>×{qty}</b> in your order</span> : <span>Not ordered</span>}
        </div>
        <QtyStepper value={qty} onChange={onChange} disabled={locked} />
      </div>
    </div>
  );
}

function MealRow({ meal, qty, onChange, locked }: { meal: Meal; qty: number; onChange: (v: number) => void; locked: boolean }) {
  const tag = tagFor(meal);
  return (
    <div className={`meal-row ${qty > 0 ? "selected" : ""}`}>
      <div className="row-photo" />
      <div className="row-main">
        <div className="row-title">{meal.title}</div>
        <div className="row-desc">{meal.description}</div>
        <div className="row-tags">
          <span>{tag.label}</span>
          <span>· €{meal.price.toFixed(2)}</span>
        </div>
      </div>
      <div className="row-count">
        {qty > 0 ? <><b>×{qty}</b><span>in order</span></> : <span style={{ color: "var(--ink-4)" }}>—</span>}
      </div>
      <QtyStepper value={qty} onChange={onChange} disabled={locked} />
    </div>
  );
}
