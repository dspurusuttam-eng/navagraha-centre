"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/modules/auth/server";
import {
  generateAstrologerCopilotBrief,
  trackAstrologerCopilotSnapshotEvent,
} from "@/modules/astrologer-copilot/service";

function getRequiredField(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${key} is required.`);
  }

  return value.trim();
}

export async function generateAstrologerCopilotBriefAction(formData: FormData) {
  const session = await requireAdminSession({
    allowedRoles: ["founder", "support"],
  });
  const consultationId = getRequiredField(formData, "consultationId");
  const result = await generateAstrologerCopilotBrief({
    consultationId,
    astrologerUserId: session.user.id,
  });

  revalidatePath("/admin/astrologer-copilot");
  redirect(
    `/admin/astrologer-copilot?consultationId=${consultationId}&snapshotId=${result.snapshotId}`
  );
}

export async function trackAstrologerCopilotCopyAction(formData: FormData) {
  await requireAdminSession({
    allowedRoles: ["founder", "support"],
  });
  const snapshotId = getRequiredField(formData, "snapshotId");

  await trackAstrologerCopilotSnapshotEvent({
    snapshotId,
    event: "copy",
  });
}

export async function trackAstrologerCopilotExportAction(formData: FormData) {
  await requireAdminSession({
    allowedRoles: ["founder", "support"],
  });
  const snapshotId = getRequiredField(formData, "snapshotId");

  await trackAstrologerCopilotSnapshotEvent({
    snapshotId,
    event: "export",
  });
}
