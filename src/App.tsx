import { Routes, Route } from "react-router";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Documentation from "./pages/Documentation";
import NotFound from "./pages/NotFound";
import { LocalDBProvider, useLocalDB } from "./providers/localdb";

function LoadingOverlay() {
  const { synced, ready, loadingRows, loadingPhase } = useLocalDB();

  if (synced) return null;

  const total = 201520;
  const pct = ready ? Math.min(100, Math.round((loadingRows / total) * 100)) : 0;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg-base)",
      }}
    >
      <div style={{ width: 420, maxWidth: "90vw", textAlign: "center" }}>
        <div style={{ marginBottom: 24 }}>
          <img
            src="/bandit.png"
            alt="Bandit"
            style={{
              width: 64,
              height: 64,
              margin: "0 auto 16px",
              borderRadius: 12,
            }}
          />
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-sans)",
            }}
          >
            Bandit
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "var(--color-text-muted)",
              marginTop: 4,
            }}
          >
            BTC Mean Reversion Dashboard
          </p>
        </div>

        <div
          style={{
            height: 6,
            borderRadius: 3,
            background: "var(--color-bg-surface)",
            overflow: "hidden",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              borderRadius: 3,
              background: "var(--color-accent-neutral)",
              transition: "width 0.3s ease",
            }}
          />
        </div>

        <p
          style={{
            fontSize: 13,
            fontFamily: "var(--font-mono)",
            color: "var(--color-text-secondary)",
            minHeight: 20,
          }}
        >
          {ready ? loadingPhase : "Initializing..."}
        </p>

        {loadingRows > 0 && (
          <p
            style={{
              fontSize: 11,
              color: "var(--color-text-muted)",
              marginTop: 8,
              fontFamily: "var(--font-mono)",
            }}
          >
            {pct}% complete
          </p>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LocalDBProvider>
      <LoadingOverlay />
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </LocalDBProvider>
  );
}
