import { Icon } from "./Icon";

export type PageId = "today" | "week" | "history" | "admin";

type Props = {
  page: PageId;
  setPage: (p: PageId) => void;
  userName: string;
};

const items: { id: PageId; label: string; icon: "today" | "week" | "history" | "admin"; num: string }[] = [
  { id: "today",   label: "Today's menu", icon: "today",   num: "01" },
  { id: "week",    label: "This week",    icon: "week",    num: "02" },
  { id: "history", label: "My orders",    icon: "history", num: "03" },
  { id: "admin",   label: "Admin",        icon: "admin",   num: "04" },
];

export function Sidebar({ page, setPage, userName }: Props) {
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">
          Handelbar<span className="dot">.</span>
        </span>
      </div>
      <div className="brand-sub" style={{ marginTop: -20 }}>
        Canteen · Stuttgart
      </div>
      <nav className="nav">
        {items.map((it) => (
          <button
            key={it.id}
            className={`nav-item ${page === it.id ? "active" : ""}`}
            onClick={() => setPage(it.id)}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Icon name={it.icon} size={15} />
              {it.label}
            </span>
            <span className="nav-num">{it.num}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-foot">
        <div className="me">
          <div className="avatar">{initials || "U"}</div>
          <div>
            <div className="me-name">{userName}</div>
            <div className="me-dept">MOCK USER · OKTA TBD</div>
          </div>
        </div>
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 10,
            color: "var(--ink-4)",
            letterSpacing: "0.08em",
          }}
        >
          v0.1 · handelbar-react
        </div>
      </div>
    </aside>
  );
}
