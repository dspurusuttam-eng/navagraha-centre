// Claude Admin Console C2C — MediaAsset repository interface + reference checker (pure DI).
import type { MediaRecord, MediaReferenceCount } from "@/modules/admin/media/types";

export type NormalizedMediaFilters = {
  kind?: string;
  search?: string;
  skip: number;
  take: number;
};

export type MediaCreateData = {
  kind: string;
  url: string;
  filename: string | null;
  mimeType: string | null;
  byteSize: number | null;
  width: number | null;
  height: number | null;
  altText: string | null;
  caption: string | null;
  createdById: string | null;
};

export type MediaUpdateData = Partial<Omit<MediaCreateData, "createdById">>;

export interface MediaRepository {
  list(filters: NormalizedMediaFilters): Promise<{ items: MediaRecord[]; total: number }>;
  findById(id: string): Promise<MediaRecord | null>;
  create(data: MediaCreateData): Promise<MediaRecord>;
  update(id: string, data: MediaUpdateData): Promise<MediaRecord>;
  remove(id: string): Promise<void>;
}

/** Counts Article + BrandSettings references to a MediaAsset id. */
export type MediaReferenceChecker = (assetId: string) => Promise<MediaReferenceCount>;
