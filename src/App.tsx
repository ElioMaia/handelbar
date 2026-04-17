import { useEffect, useState } from "react";
import { api } from "./api";
import { Sidebar, type PageId } from "./components/Sidebar";
import { TodayPage } from "./pages/TodayPage";
import { WeekPage } from "./pages/WeekPage";
import { HistoryPage } from "./pages/HistoryPage";
import { AdminPage } from "./pages/AdminPage";
import { Icon } from "./components/Icon";

type Theme = "light" | "dark";
type View = "card" | "list";

const THEME_KEY = "handelbar.theme";
const VIEW_KEY = "handelbar.view";
const PAGE_KEY = "handelbar.page";

export function App() {
  const [page, setPage] = useState<PageId>(
    () => (localStorage.getItem(PAGE_KEY) as PageId) || "today"
  );
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(THEME_KEY) as Theme) || "light"
  );
  const [view, setView] = useState<View>(
    () => (localStorage.getItem(VIEW_KEY) as View) || "card"
  );
  const [userName, setUserName] = useState<string>("…");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => { localStorage.setItem(VIEW_KEY, view); }, [view]);
  useEffect(() => { localStorage.setItem(PAGE_KEY, page); }, [page]);

  useEffect(() => {
    api.getMe().then((m) => setUserName(m.name)).catch(() => setUserName("Guest"));
  }, []);

  return (
    <div className="app">
      <Sidebar page={page} setPage={setPage} userName={userName} />
      <main className="main">
        {page === "today"   && <TodayPage view={view} setView={setView} />}
        {page === "week"    && <WeekPage />}
        {page === "history" && <HistoryPage />}
        {page === "admin"   && <AdminPage />}
      </main>

      <button
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 199,
          width: 40,
          height: 40,
          borderRadius: 20,
          background: "var(--ink)",
          color: "var(--bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "var(--shadow-md)",
          border: "none",
          cursor: "pointer",
        }}
        aria-label="Toggle theme"
      >
        <Icon name={theme === "light" ? "moon" : "sun"} size={16} />
      </button>
    </div>
  );
}
