/** Per-navigation entrance for marketing pages; chrome stays put. */
export default function MarketingTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
