import { Icon } from "./Icon";

export function Countdown({ locked, deadlineText }: { locked: boolean; deadlineText: string }) {
  return (
    <div className={`countdown ${locked ? "locked" : ""}`}>
      <span className="dot" />
      {locked ? "Locked for today" : `Order by ${deadlineText}`}
    </div>
  );
}

type View = "card" | "list";
export function ViewToggle({ view, setView }: { view: View; setView: (v: View) => void }) {
  return (
    <div className="view-toggle">
      <button className={view === "card" ? "active" : ""} onClick={() => setView("card")}>
        <Icon name="grid" size={13} /> Cards
      </button>
      <button className={view === "list" ? "active" : ""} onClick={() => setView("list")}>
        <Icon name="list" size={13} /> List
      </button>
    </div>
  );
}

export function QtyStepper({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        border: "1px solid var(--line)",
        borderRadius: 8,
        background: "var(--bg)",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={disabled || value <= 0}
        style={stepBtn}
        aria-label="Decrease"
      >
        <Icon name="minus" size={14} />
      </button>
      <span
        style={{
          minWidth: 36,
          textAlign: "center",
          fontFamily: "var(--mono)",
          fontSize: 14,
          color: "var(--ink)",
          fontWeight: 500,
        }}
      >
        ×{value}
      </span>
      <button
        onClick={() => onChange(Math.min(10, value + 1))}
        disabled={disabled}
        style={stepBtn}
        aria-label="Increase"
      >
        <Icon name="plus" size={14} />
      </button>
    </div>
  );
}

const stepBtn: React.CSSProperties = {
  width: 32,
  height: 32,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--ink-2)",
  background: "transparent",
  border: "none",
  cursor: "pointer",
};
