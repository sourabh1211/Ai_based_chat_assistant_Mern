import React, { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer
} from "recharts";
import { fetchAnalytics } from "../api";

export default function Analytics() {
  const [adminKey, setAdminKey] = useState(localStorage.getItem("admin_key") || "");
  const [summary, setSummary] = useState(null);
  const [topQueries, setTopQueries] = useState([]);
  const [daily, setDaily] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const ready = useMemo(() => adminKey.trim().length > 0, [adminKey]);

  useEffect(() => {
    if (!ready) return;

    localStorage.setItem("admin_key", adminKey);

    (async () => {
      try {
        setErr("");
        setLoading(true);

        const [s, tq, d] = await Promise.all([
          fetchAnalytics("/api/analytics/summary", adminKey),
          fetchAnalytics("/api/analytics/top-queries?limit=10", adminKey),
          fetchAnalytics("/api/analytics/daily?days=14", adminKey)
        ]);

        setSummary(s);
        setTopQueries(tq);
        setDaily(d);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [adminKey, ready]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-50">
      <div className="mx-auto max-w-6xl px-4 py-6 space-y-5">
        <Header />

        <div className="relative overflow-hidden rounded-[28px] border border-black/10 bg-white/70 backdrop-blur-xl shadow-[0_18px_55px_-28px_rgba(0,0,0,0.35)]">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.04)_1px,transparent_0)] [background-size:18px_18px]" />
          </div>

          <div className="relative p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <div className="text-sm text-zinc-500">/admin/analytics</div>
                <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">
                  Analytics Dashboard
                </h2>
                <p className="text-sm text-zinc-600 mt-1">
                  Track sessions, query volume, and what users ask most.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={[
                    "text-xs px-3 py-1.5 rounded-full border",
                    ready ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" : "bg-black/5 text-zinc-700 border-black/10"
                  ].join(" ")}
                >
                  {ready ? "Authorized" : "Enter admin key"}
                </span>

                <button
                  onClick={() => window.location.reload()}
                  className="text-xs px-3 py-1.5 rounded-full bg-white hover:bg-black/5 border border-black/10 text-zinc-800 transition"
                >
                  Refresh
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white shadow-sm p-4 space-y-2">
              <label className="text-sm font-semibold text-zinc-800">
                Admin Key <span className="text-zinc-500 font-normal">(x-admin-key)</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Enter ADMIN_API_KEY"
                  className="flex-1 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
                />
                <button
                  disabled={!ready}
                  className="rounded-2xl px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-black via-zinc-900 to-black shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </div>
              {err && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {err}
                </div>
              )}
            </div>

            {loading && (
              <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-zinc-600">
                Loading analytics…
              </div>
            )}

            {summary && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <StatCard title="Sessions" value={summary.sessions} icon={<UsersIcon />} />
                <StatCard title="Total Queries" value={summary.queries} icon={<BoltIcon />} />
                <StatCard
                  title="Avg Response (ms)"
                  value={summary.avgResponseTimeMs}
                  icon={<ClockIcon />}
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel title="Top Queries" subtitle="Most common questions (Top 10)">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topQueries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="query" hide />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" radius={[10, 10, 4, 4]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 divide-y divide-black/5 rounded-2xl border border-black/10 bg-white/60 overflow-hidden">
              {topQueries.map((q) => (
                <div key={q.query} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-zinc-900 truncate">{q.query}</div>
                    <div className="text-xs text-zinc-500">Query</div>
                  </div>
                  <span className="shrink-0 text-sm font-extrabold text-zinc-900 px-3 py-1 rounded-full bg-black/5 border border-black/10">
                    {q.count}
                  </span>
                </div>
              ))}
              {!topQueries.length && (
                <div className="px-4 py-3 text-sm text-zinc-600">No data yet.</div>
              )}
            </div>
          </Panel>

          <Panel title="Daily Volume" subtitle="Last 14 days query traffic">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <MiniPill label="Days" value={daily.length || 0} />
              <MiniPill
                label="Max"
                value={daily.reduce((m, x) => Math.max(m, x.count || 0), 0)}
              />
              <MiniPill
                label="Total"
                value={daily.reduce((s, x) => s + (x.count || 0), 0)}
              />
              <MiniPill
                label="Avg"
                value={
                  daily.length
                    ? Math.round(daily.reduce((s, x) => s + (x.count || 0), 0) / daily.length)
                    : 0
                }
              />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-black to-zinc-700 text-white grid place-items-center shadow-md">
          <ChartIcon />
        </div>
        <div>
          <div className="text-sm text-zinc-500">Admin</div>
          <div className="text-xl font-extrabold tracking-tight text-zinc-900">
            Knowledge Base Analytics
          </div>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-2">
        <span className="text-xs px-3 py-1.5 rounded-full bg-black/5 border border-black/10 text-zinc-700">
          Premium UI
        </span>
      </div>
    </div>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-black/10 bg-white/70 backdrop-blur-xl shadow-[0_18px_55px_-28px_rgba(0,0,0,0.35)]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -left-20 h-56 w-56 rounded-full bg-violet-500/12 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-cyan-400/12 blur-3xl" />
      </div>
      <div className="relative p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="text-lg font-extrabold tracking-tight text-zinc-900">{title}</h3>
            <p className="text-sm text-zinc-600">{subtitle}</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-black/10 bg-white shadow-sm">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-16 -left-16 h-40 w-40 rounded-full bg-violet-500/10 blur-2xl" />
        <div className="absolute -bottom-16 -right-16 h-40 w-40 rounded-full bg-cyan-400/10 blur-2xl" />
      </div>
      <div className="relative p-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-zinc-700">{title}</div>
          <div className="text-3xl font-extrabold mt-1 text-zinc-900">{value}</div>
        </div>
        <div className="h-11 w-11 rounded-2xl bg-black/5 border border-black/10 grid place-items-center text-zinc-800">
          {icon}
        </div>
      </div>
    </div>
  );
}

function MiniPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/70 px-4 py-3">
      <div className="text-[11px] text-zinc-500">{label}</div>
      <div className="text-lg font-extrabold text-zinc-900">{value}</div>
    </div>
  );
}

/* Icons */
function ChartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-90">
      <path d="M4 19V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 19V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 19V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 19H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M22 21v-2a4 4 0 0 0-3-3.87"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16 3.13a4 4 0 0 1 0 7.75"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function BoltIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M13 2L3 14h7l-1 8 10-12h-7l1-8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 7v5l3 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
