// Claude Admin Console C2C — Media service DTOs (pure).
export type MediaRecord = {
  id: string;
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
  createdAt: Date;
  updatedAt: Date;
};

export type MediaListFilters = {
  kind?: string | null;
  search?: string | null;
  page?: number | null;
  pageSize?: number | null;
};

export type MediaListResult = {
  items: MediaRecord[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type MediaActor = {
  userId: string;
  roleKeys: readonly string[];
  primaryRoleKey: string | null;
};

/** Reference counts across entities that can point at a MediaAsset. */
export type MediaReferenceCount = { articles: number; brand: number; total: number };

export type ServiceResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; code: string; message: string; issues?: unknown };
