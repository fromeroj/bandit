import { Link, useLocation } from "react-router";
import { Activity, BarChart3, Settings, TrendingUp } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    { path: "/", label: "Dashboard", icon: Activity },
    { path: "/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg-base)" }}>
      {/* Top Navigation */}
      <nav
        className="sticky top-0 z-50 border-b"
        style={{
          background: "var(--color-bg-base)",
          borderColor: "var(--color-border-subtle)",
        }}
      >
        <div className="max-w-[1440px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp
              className="w-5 h-5"
              style={{ color: "var(--color-accent-buy)" }}
            />
            <span
              className="text-lg font-semibold tracking-tight"
              style={{
                fontFamily: "var(--font-sans)",
                color: "var(--color-text-primary)",
              }}
            >
              Bandit
            </span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded ml-1 font-medium"
              style={{
                background: "var(--color-bg-surface)",
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-mono)",
              }}
            >
              BTC/USDT
            </span>
          </div>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = path === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors"
                  style={{
                    color: isActive
                      ? "var(--color-text-primary)"
                      : "var(--color-text-secondary)",
                    borderBottom: isActive
                      ? "2px solid var(--color-accent-neutral)"
                      : "2px solid transparent",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto px-6 py-6">{children}</main>
    </div>
  );
}
