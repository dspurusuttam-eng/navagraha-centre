// Claude Admin Console C1A — Admin domain barrel (types + Zod schemas + lifecycle).
// Pure, framework-agnostic. Consumed by Admin services/APIs in C1B+.
export {
  ADMIN_ARTICLE_LOCALES,
  adminArticleLocaleSchema,
  ADMIN_ARTICLE_CATEGORIES,
  adminArticleCategorySchema,
  ADMIN_ARTICLE_STATES,
  adminArticleStateSchema,
  mediaReferenceIdSchema,
  type AdminArticleLocale,
  type AdminArticleCategory,
  type AdminArticleState,
} from "@/modules/admin/domain/types";

export {
  ARTICLE_LIFECYCLE_TRANSITIONS,
  ARTICLE_TRANSITION_ACTIONS,
  canTransition,
  resolveTransition,
  transitionTimestampField,
  isPubliclyVisibleState,
  type ArticleTransitionAction,
  type TransitionResolution,
} from "@/modules/admin/domain/lifecycle";

export {
  createArticleSchema,
  updateArticleSchema,
  articleTransitionSchema,
  estimateReadingTimeMinutes,
  type CreateArticleInput,
  type UpdateArticleInput,
  type ArticleTransitionInput,
} from "@/modules/admin/domain/article";

export {
  MEDIA_ASSET_KINDS,
  mediaAssetKindSchema,
  IMAGE_MIME_TYPES,
  imageMimeTypeSchema,
  createMediaAssetSchema,
  updateMediaAssetSchema,
  type MediaAssetKind,
  type CreateMediaAssetInput,
  type UpdateMediaAssetInput,
} from "@/modules/admin/domain/media";

export {
  brandSocialLinkSchema,
  brandSettingsSchema,
  brandSettingsPatchSchema,
  defaultBrandSettings,
  type BrandSocialLink,
  type BrandSettingsInput,
  type BrandSettingsPatch,
} from "@/modules/admin/domain/brand-settings";

export {
  CONSULTATION_AVAILABILITY,
  CONSULTATION_LOCALES,
  consultationConfigSchema,
  consultationConfigPatchSchema,
  defaultConsultationConfig,
  type ConsultationAvailability,
  type ConsultationLocale,
  type ConsultationConfig,
  type ConsultationConfigPatch,
} from "@/modules/admin/domain/consultation-config";
