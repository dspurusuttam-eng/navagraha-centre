import { validateLaunchEnvironment } from "@/config/env";
import { trackServerEvent } from "@/lib/observability";

export async function register() {
  const validation = validateLaunchEnvironment();

  trackServerEvent(
    "app.bootstrap",
    {
      valid: validation.valid,
      issueCount: validation.issues.length,
    },
    validation.valid ? "info" : "warning"
  );
}
