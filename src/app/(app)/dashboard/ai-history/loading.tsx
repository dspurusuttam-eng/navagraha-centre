export default function DashboardAIHistoryLoading() {
  return (
    <main className="min-h-screen bg-[#FFFFFF] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="h-28 animate-pulse rounded-[var(--radius-2xl)] border border-[#EAEAEA] bg-white" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-24 animate-pulse rounded-[var(--radius-2xl)] border border-[#EAEAEA] bg-white" />
          <div className="h-24 animate-pulse rounded-[var(--radius-2xl)] border border-[#EAEAEA] bg-white" />
          <div className="h-24 animate-pulse rounded-[var(--radius-2xl)] border border-[#EAEAEA] bg-white" />
        </div>
        <div className="h-[28rem] animate-pulse rounded-[var(--radius-2xl)] border border-[#EAEAEA] bg-white" />
      </div>
    </main>
  );
}
