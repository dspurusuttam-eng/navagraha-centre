import { LoadingPanel } from "@/components/feedback/loading-panel";

export default function RootLoading() {
  return (
    <LoadingPanel
      eyebrow="Loading"
      title="Preparing the NAVAGRAHA CENTRE experience."
      description="A calm fallback is in place while the next route segment finishes loading."
    />
  );
}
