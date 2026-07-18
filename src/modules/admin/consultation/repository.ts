// Claude Admin Console C2B1 — ConsultationSettings singleton repository (pure DI boundary).
import type { ConsultationConfig } from "@/modules/admin/domain";

export interface ConsultationSettingsRepository {
  /** Current config parsed from the singleton, or null when unset. */
  get(): Promise<ConsultationConfig | null>;
  /** Persist (upsert) the singleton config and return the stored value. */
  save(config: ConsultationConfig): Promise<ConsultationConfig>;
}
