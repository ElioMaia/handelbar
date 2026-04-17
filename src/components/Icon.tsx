import type { CSSProperties } from "react";

type Props = { name: IconName; size?: number; style?: CSSProperties };

export type IconName =
  | "today" | "week" | "history" | "admin"
  | "grid" | "list" | "check" | "x"
  | "sun" | "moon" | "sliders" | "clock"
  | "flame" | "users" | "plus" | "minus" | "download";

export function Icon({ name, size = 16, style }: Props) {
  const s = {
    width: size, height: size, strokeWidth: 1.5, stroke: "currentColor",
    fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
    style,
  };
  return (
    <svg viewBox="0 0 24 24" {...s}>
      {paths[name]}
    </svg>
  );
}

const paths: Record<IconName, JSX.Element> = {
  today:    <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  week:     <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M9 10v11M15 10v11" /></>,
  history:  <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  admin:    <><path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z" /></>,
  grid:     <><rect x="4" y="4" width="7" height="7" /><rect x="13" y="4" width="7" height="7" /><rect x="4" y="13" width="7" height="7" /><rect x="13" y="13" width="7" height="7" /></>,
  list:     <><path d="M8 6h12M8 12h12M8 18h12" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></>,
  check:    <path d="M5 12l5 5 9-11" strokeWidth={2} />,
  x:        <path d="M6 6l12 12M18 6l-12 12" />,
  sun:      <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  moon:     <path d="M20 15a8 8 0 01-11-11 8.5 8.5 0 1011 11z" />,
  sliders:  <><path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h14M20 18h0" /><circle cx="16" cy="6" r="2" /><circle cx="8" cy="12" r="2" /><circle cx="18" cy="18" r="2" fill="currentColor" /></>,
  clock:    <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  flame:    <path d="M12 3c0 3-3 4-3 8a3 3 0 006 0c0-1-1-2-1-3 0 0 3 2 3 5a5 5 0 11-10 0c0-5 5-6 5-10z" />,
  users:    <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3 3-5 6-5s6 2 6 5M15 10a3 3 0 100-5M21 20c0-2-2-4-4.5-4.5" /></>,
  plus:     <path d="M12 5v14M5 12h14" />,
  minus:    <path d="M5 12h14" />,
  download: <><path d="M12 3v13M6 10l6 6 6-6M4 21h16" /></>,
};
