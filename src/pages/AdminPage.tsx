import { useEffect, useState } from "react";
import { api } from "../api";
import type { AdminMealInput } from "../types";

type Row = AdminMealInput;

function emptyRow(): Row {
  return { title: "", description: "", price: 0, is_vegan: false, is_vegetarian: false };
}

function todayIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function AdminPage() {
  const [date, setDate] = useState<string>(todayIso());
  const [rows, setRows] = useState<Row[]>([emptyRow(), emptyRow(), emptyRow()]);
  const [editing, setEditing] = useState(0);
  const [status, setStatus] = useState<"idle" | "saving" | "ok" | "err">("idle");
  const [statusMsg, setStatusMsg] = useState<string>("");

  useEffect(() => {
    api.getAdminMeals(date)
      .then((res) => {
        if (res.meals.length === 3) {
          setRows(res.meals.map((m) => ({
            title: m.title,
            description: m.description,
            price: m.price,
            is_vegan: m.is_vegan,
            is_vegetarian: m.is_vegetarian,
          })));
        }
      })
      .catch(() => { /* no meals yet for that date */ });
  }, [date]);

  const cur = rows[editing];
  const update = <K extends keyof Row>(k: K, v: Row[K]) => {
    const next = rows.slice();
    next[editing] = { ...next[editing], [k]: v };
    setRows(next);
  };

  const publish = async () => {
    setStatus("saving");
    try {
      await api.postAdminMeals({ date, meals: rows });
      setStatus("ok");
      setStatusMsg(`Menu for ${date} published`);
    } catch (e: any) {
      setStatus("err");
      setStatusMsg(e?.message ?? "Publish failed");
    }
  };

  const exportCsv = () => {
    // Triggers the browser to download the CSV from /admin/export
    window.open(api.exportCsvUrl(date), "_blank");
  };

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-sub">KITCHEN · ADMIN</div>
          <h1 className="page-title">Post a menu</h1>
        </div>
        <div className="page-meta">
          <button className="btn ghost sm" onClick={exportCsv}>Export CSV</button>
          <button className="btn" onClick={publish} disabled={status === "saving"}>
            {status === "saving" ? "Publishing…" : `Publish for ${date}`}
          </button>
        </div>
      </div>

      {status === "ok" && (
        <div className="confirmed-banner">
          <div className="check">✓</div>
          <div className="cb-main">
            <b>Published.</b>
            <p>{statusMsg}</p>
          </div>
        </div>
      )}
      {status === "err" && (
        <div className="confirmed-banner" style={{ borderLeftColor: "var(--accent)" }}>
          <div className="check" style={{ background: "var(--accent)" }}>!</div>
          <div className="cb-main">
            <b>Could not publish.</b>
            <p>{statusMsg}</p>
          </div>
        </div>
      )}

      <div className="admin-split">
        <div className="admin-form">
          <h3>Meal {editing + 1} of 3</h3>

          <div className="form-row">
            <label>Serving date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="form-row">
            <label>Dietary</label>
            <div className="tag-pick">
              <button
                className={cur.is_vegan ? "on" : ""}
                onClick={() => update("is_vegan", !cur.is_vegan)}
              >VEGAN</button>
              <button
                className={cur.is_vegetarian ? "on" : ""}
                onClick={() => update("is_vegetarian", !cur.is_vegetarian)}
              >VEGETARIAN</button>
            </div>
          </div>

          <div className="form-row">
            <label>Dish name</label>
            <input
              value={cur.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g. Pasta Arrabbiata"
            />
          </div>

          <div className="form-row">
            <label>Description</label>
            <textarea
              value={cur.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="form-row">
            <label>Price (€)</label>
            <input
              type="number"
              step="0.10"
              value={cur.price}
              onChange={(e) => update("price", parseFloat(e.target.value) || 0)}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 20,
              paddingTop: 16,
              borderTop: "1px solid var(--line-soft)",
            }}
          >
            <button
              className="btn ghost sm"
              onClick={() => setEditing(Math.max(0, editing - 1))}
              disabled={editing === 0}
            >← Previous</button>
            <button
              className="btn sm"
              onClick={() => setEditing(Math.min(2, editing + 1))}
              disabled={editing === 2}
            >Next meal →</button>
          </div>
        </div>

        <div className="admin-preview-card">
          <div className="kicker">Menu preview · {date}</div>
          <div className="admin-slots">
            {rows.map((s, i) => (
              <div
                key={i}
                className="admin-slot"
                onClick={() => setEditing(i)}
                style={{
                  cursor: "pointer",
                  outline: editing === i ? "2px solid var(--ink)" : "none",
                  outlineOffset: 2,
                }}
              >
                <div className="admin-slot-photo" />
                <div className="admin-slot-main">
                  <div className="admin-slot-tag">
                    {s.is_vegan ? "VEGAN" : s.is_vegetarian ? "VEGETARIAN" : "MEAT / FISH"}
                    {s.price ? ` · €${s.price.toFixed(2)}` : ""}
                  </div>
                  <div className="admin-slot-title">{s.title || "Untitled meal"}</div>
                  <div className="admin-slot-desc">{s.description || "No description"}</div>
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 18,
              paddingTop: 14,
              borderTop: "1px solid var(--line-soft)",
              fontFamily: "var(--mono)",
              fontSize: 11,
              color: "var(--ink-3)",
              letterSpacing: "0.06em",
              lineHeight: 1.6,
            }}
          >
            Cut-off <b style={{ color: "var(--ink)" }}>09:00 Europe/Berlin</b>. After that, orders lock.
          </div>
        </div>
      </div>
    </>
  );
}
