export default function DashboardKundliLoading() {
  return (
    <main className="min-h-screen bg-[#FFFFFF] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="h-28 animate-pulse rounded-[var(--radius-2xl)] border border-[#EAEAEA] bg-white" />
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="h-[38rem] animate-pulse rounded-[var(--radius-2xl)] border border-[#EAEAEA] bg-white" />
          <div className="h-[38rem] animate-pulse rounded-[var(--radius-2xl)] border border-[#EAEAEA] bg-white" />
        </div>
      </div>
    </main>
  );
}
