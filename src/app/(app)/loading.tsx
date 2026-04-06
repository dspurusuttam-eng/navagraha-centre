import { LoadingPanel } from "@/components/feedback/loading-panel";

export default function AppLoading() {
  return (
    <LoadingPanel
      eyebrow="Member Area"
      title="Preparing the protected dashboard experience."
      description="Private account surfaces are loading with a graceful fallback in place."
    />
  );
}
