/** Per-navigation entrance for judge pages; the booth shell stays put. */
export default function JudgeTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
