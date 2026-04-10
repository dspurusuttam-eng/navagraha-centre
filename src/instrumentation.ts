import { validateLaunchEnvironment } from "@/config/env";
import { trackServerEvent } from "@/lib/observability";

export async function register() {
  const validation = validateLaunchEnvironment();
  const forceBootstrapLog =
    process.env.OBSERVABILITY_BOOTSTRAP_LOG === "true";
  const hasIssues = validation.issues.length > 0;

  if (!forceBootstrapLog && !hasIssues) {
    return;
  }

  trackServerEvent("app.bootstrap", {
    valid: validation.valid,
    issueCount: validation.issues.length,
    forced: forceBootstrapLog,
  }, validation.valid ? "info" : "warning");
}
