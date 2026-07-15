// Claude Admin Console C2B2 — BrandSettings singleton repository (pure DI boundary).
import type { BrandSettingsInput } from "@/modules/admin/domain";

export interface BrandSettingsRepository {
  get(): Promise<BrandSettingsInput | null>;
  save(config: BrandSettingsInput): Promise<BrandSettingsInput>;
}
