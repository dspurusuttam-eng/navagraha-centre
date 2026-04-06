import { LoadingPanel } from "@/components/feedback/loading-panel";

export default function AdminLoading() {
  return (
    <LoadingPanel
      eyebrow="Admin"
      title="Preparing the control panel."
      description="Internal operations routes are loading with a calm fallback state ready if needed."
    />
  );
}
