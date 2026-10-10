import React, {
  Component,
  lazy,
  Suspense,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes, Link } from "react-router-dom";
import { ContentContext } from "./context";
import { loadContent } from "./services/content";
import { Layout } from "./layouts/Layout";
import { Home } from "./pages/Home";
import { Practice } from "./pages/Practice";
import { SessionPage } from "./pages/SessionPage";
import { Review } from "./pages/Review";
import { Mock } from "./pages/Mock";
import { Glossary } from "./pages/Glossary";
import { Settings } from "./pages/Settings";
import { Materials } from "./pages/Materials";
import "./styles/app.css";
const Stats = lazy(() =>
  import("./pages/Stats").then((m) => ({ default: m.Stats })),
);
class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div className="startup card">
        <h1>画面を表示できませんでした</h1>
        <p>
          ブラウザのIndexedDBが利用可能か確認してください。学習データを削除せず、再読み込みでお試しください。
        </p>
        <button className="btn primary" onClick={() => location.reload()}>
          再読み込み
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
function App() {
  const [content, setContent] =
      useState<Awaited<ReturnType<typeof loadContent>>>(),
    [error, setError] = useState("");
  useEffect(() => {
    void loadContent()
      .then(setContent)
      .catch((e) => setError(e.message));
  }, []);
  if (!content)
    return (
      <div className="startup card">
        <h1>AZ-900版 道場</h1>
        <p role="status">{error || "学習の準備をしています…"}</p>
        {error && (
          <button className="btn primary" onClick={() => location.reload()}>
            再読み込み
          </button>
        )}
      </div>
    );
  return (
    <ContentContext.Provider value={content}>
      <HashRouter>
        <Suspense
          fallback={
            <p className="startup" role="status">
              読み込み中…
            </p>
          }
        >
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="practice" element={<Practice />} />
              <Route path="domains" element={<Practice domainPage />} />
              <Route path="session/:id" element={<SessionPage />} />
              <Route path="review" element={<Review />} />
              <Route path="bookmarks" element={<Review bookmarks />} />
              <Route path="mock" element={<Mock />} />
              <Route path="stats" element={<Stats />} />
              <Route path="glossary" element={<Glossary />} />
              <Route path="settings" element={<Settings />} />
              <Route path="materials" element={<Materials />} />
              <Route
                path="*"
                element={
                  <div className="card panel">
                    <h1>ページが見つかりません</h1>
                    <Link to="/">ホームに戻る</Link>
                  </div>
                }
              />
            </Route>
          </Routes>
        </Suspense>
      </HashRouter>
    </ContentContext.Provider>
  );
}
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
