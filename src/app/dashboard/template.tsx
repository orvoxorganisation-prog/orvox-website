/** Per-navigation entrance for dashboard pages; the console shell stays put. */
export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
