import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import {
  Home,
  Layers3,
  RotateCcw,
  BookOpen,
  ChartNoAxesCombined,
  Bookmark,
  Settings,
  ClipboardCheck,
  Cloud,
  ChevronRight,
  WifiOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useStudyData } from "../hooks/useStudyData";
import { useRegisterSW } from "virtual:pwa-register/react";
const menu = [
  { to: "/", label: "ホーム", icon: Home },
  { to: "/practice", label: "問題演習", icon: Layers3 },
  { to: "/review", label: "間違えた問題", icon: RotateCcw },
  { to: "/mock", label: "模擬試験", icon: ClipboardCheck },
  { to: "/stats", label: "学習履歴・成績", icon: ChartNoAxesCombined },
  { to: "/glossary", label: "Azure用語辞典", icon: BookOpen },
  { to: "/bookmarks", label: "ブックマーク", icon: Bookmark },
  { to: "/settings", label: "設定・バックアップ", icon: Settings },
];
const mobile = [menu[0], menu[1], menu[2], menu[5], menu[4]];
export function Layout() {
  const data = useStudyData();
  const location = useLocation();
  const [online, setOnline] = useState(navigator.onLine);
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();
  useEffect(() => {
    const query = matchMedia("(prefers-color-scheme: dark)");
    const apply = () =>
      document.documentElement.classList.toggle(
        "dark",
        data?.settings.theme === "dark" ||
          (data?.settings.theme !== "light" && query.matches),
      );
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, [data?.settings.theme]);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);
  useEffect(() => {
    const on = () => setOnline(true),
      off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          const main = document.getElementById("main");
          main?.focus();
          main?.scrollIntoView();
        }}
      >
        本文へスキップ
      </a>
      <aside className="sidebar">
        <Link to="/" className="brand">
          <span className="brand-icon">
            <Cloud />
          </span>
          <span>
            AZ-900版 <b>道場</b>
            <small>AZURE FUNDAMENTALS</small>
          </span>
        </Link>
        <p className="sidebar-label">学習メニュー</p>
        <nav aria-label="メインナビゲーション">
          {menu.map((m) => (
            <NavLink
              end={m.to === "/"}
              key={m.to}
              to={m.to}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <m.icon size={19} />
              {m.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-tip">
          <span className="tiny-badge">LOCAL FIRST</span>
          <p>
            あなたの学びは、
            <br />
            このブラウザに。
          </p>
          <small>登録不要。学習データは端末内に保存されます。</small>
          <Link to="/settings">
            バックアップする <ChevronRight size={14} />
          </Link>
        </div>
        <p className="sidebar-foot">非公式の独立した学習アプリ</p>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <Link to="/" className="mobile-brand">
            <Cloud size={24} /> AZ-900版 道場
          </Link>
          <span className="desktop-only muted">
            Azure Fundamentals 合格を目指そう
          </span>
          <div className="topbar-right">
            {!online && (
              <span className="chip">
                <WifiOff size={14} />
                オフライン
              </span>
            )}
            <span className="version-badge">2026年7月版対応</span>
            <Link
              className="icon-btn"
              aria-label="設定・バックアップ"
              to="/settings"
            >
              <Settings size={19} />
            </Link>
          </div>
        </header>
        {needRefresh && (
          <div className="update-banner" role="status">
            新しいバージョンがあります。回答の保存後に更新してください。
            <button onClick={() => void updateServiceWorker(true)}>
              更新する
            </button>
            <button onClick={() => setNeedRefresh(false)}>あとで</button>
          </div>
        )}
        <main id="main" tabIndex={-1}>
          <Outlet />
        </main>
        <footer className="footer">
          AZ-900版 道場 · Microsoftとは関係のない独立した学習教材です。
          <Link to="/settings">データの保存について</Link>
        </footer>
      </div>
      <nav className="bottom-nav" aria-label="モバイルナビゲーション">
        {mobile.map((m, i) => (
          <NavLink end={m.to === "/"} key={m.to} to={m.to}>
            <m.icon size={21} />
            <span>{["ホーム", "問題", "復習", "辞典", "成績"][i]}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
