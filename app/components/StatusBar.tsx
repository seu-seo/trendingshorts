export default function StatusBar() {
  return (
    <div className="flex-shrink-0 flex justify-between items-center px-6 pt-3.5 pb-1.5 font-mono text-xs font-medium" style={{ color: 'var(--color-ink, #F2F0EB)' }}>
      <span>9:41</span>
      <div className="flex gap-1.5 items-center opacity-80">
        <span>●●●</span>
        <span>📶</span>
        <span>100%</span>
      </div>
    </div>
  );
}
