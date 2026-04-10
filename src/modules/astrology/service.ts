import "server-only";

import { unstable_cache } from "next/cache";
import type { AstrologyProvider } from "@/modules/astrology/provider";
import { CircularNatalHoroscopeProvider } from "@/modules/astrology/providers/circular-natal-horoscope-provider";
import { MockDeterministicAstrologyProvider } from "@/modules/astrology/providers/mock-deterministic-provider";
import type {
  AstrologyValidationResult,
  BirthDetails,
  BirthDetailsInput,
  DivisionalChartRequest,
  DivisionalChartRequestInput,
  DivisionalChartResponse,
  NatalChartRequest,
  NatalChartRequestInput,
  NatalChartResponse,
  TransitChartRequest,
  TransitChartRequestInput,
  TransitChartResponse,
} from "@/modules/astrology/types";
import {
  AstrologyValidationError,
  validateBirthDetails,
  validateDivisionalChartRequest,
  validateNatalChartRequest,
  validateTransitChartRequest,
} from "@/modules/astrology/validation";

const providerFactories = {
  "mock-deterministic": () => new MockDeterministicAstrologyProvider(),
  "circular-natal-real": () => new CircularNatalHoroscopeProvider(),
} as const;

export type AstrologyProviderKey =
  | keyof typeof providerFactories
  | "swisseph-vedic";

const providerCache = new Map<AstrologyProviderKey, Promise<AstrologyProvider>>();

async function createSwissEphemerisProvider(): Promise<AstrologyProvider> {
  try {
    const module = await import(
      "@/modules/astrology/providers/swisseph-vedic-provider"
    );

    return new module.SwissEphemerisVedicProvider();
  } catch (error) {
    console.error(
      "swisseph-vedic provider unavailable, falling back to mock-deterministic",
      error
    );

    return new MockDeterministicAstrologyProvider();
  }
}

function resolveProvider(providerKey: AstrologyProviderKey) {
  const cachedProvider = providerCache.get(providerKey);

  if (cachedProvider) {
    return cachedProvider;
  }

  const providerPromise =
    providerKey === "swisseph-vedic"
      ? createSwissEphemerisProvider()
      : Promise.resolve(providerFactories[providerKey]());

  providerCache.set(providerKey, providerPromise);

  return providerPromise;
}

const getCachedNatalChart = unstable_cache(
  async (providerKey: AstrologyProviderKey, serializedRequest: string) => {
    const provider = await resolveProvider(providerKey);
    const request = JSON.parse(serializedRequest) as NatalChartRequest;

    return provider.getNatalChart(request);
  },
  ["astrology", "service", "natal"],
  { tags: ["astrology", "astrology:natal"] }
);

function getNatalCacheKey(
  providerKey: AstrologyProviderKey,
  request: NatalChartRequest
) {
  return JSON.stringify({
    providerKey,
    birthDetails: request.birthDetails,
    houseSystem: request.houseSystem,
  });
}

function getDivisionalRequestPayload(request: DivisionalChartRequest) {
  return JSON.stringify(request);
}

function getTransitRequestPayload(request: TransitChartRequest) {
  return JSON.stringify(request);
}

function isAstrologyProviderKey(value: string): value is AstrologyProviderKey {
  return Object.prototype.hasOwnProperty.call(providerFactories, value);
}

export function getDefaultAstrologyProviderKey(): AstrologyProviderKey {
  const configuredProvider = process.env.ASTROLOGY_PROVIDER;

  if (configuredProvider && isAstrologyProviderKey(configuredProvider)) {
    return configuredProvider;
  }

  return "swisseph-vedic";
}

export interface AstrologyService {
  readonly providerKey: AstrologyProviderKey;
  validateBirthDetails(
    input: BirthDetailsInput
  ): AstrologyValidationResult<BirthDetails>;
  getNatalChart(request: NatalChartRequestInput): Promise<NatalChartResponse>;
  getTransitSnapshot(
    request: TransitChartRequestInput
  ): Promise<TransitChartResponse>;
  getDivisionalChart(
    request: DivisionalChartRequestInput
  ): Promise<DivisionalChartResponse>;
}

function assertSuccess<T>(result: AstrologyValidationResult<T>) {
  if (!result.success) {
    throw new AstrologyValidationError(result.issues);
  }

  return result.data;
}

export function createAstrologyService(
  providerKey: AstrologyProviderKey
): AstrologyService {
  return {
    providerKey,
    validateBirthDetails,
    async getNatalChart(request) {
      const validatedRequest = assertSuccess(
        validateNatalChartRequest(request)
      );

      return getCachedNatalChart(
        providerKey,
        JSON.stringify({
          ...validatedRequest,
          requestId: getNatalCacheKey(providerKey, validatedRequest),
        })
      ).then((response) => ({
        ...response,
        metadata: {
          ...response.metadata,
          requestId: validatedRequest.requestId,
        },
      }));
    },
    async getTransitSnapshot(request) {
      const validatedRequest = assertSuccess(
        validateTransitChartRequest(request)
      );
      const provider = await resolveProvider(providerKey);

      return provider.getTransitSnapshot(
        JSON.parse(
          getTransitRequestPayload(validatedRequest)
        ) as TransitChartRequest
      );
    },
    async getDivisionalChart(request) {
      const validatedRequest = assertSuccess(
        validateDivisionalChartRequest(request)
      );
      const provider = await resolveProvider(providerKey);

      return provider.getDivisionalChart(
        JSON.parse(
          getDivisionalRequestPayload(validatedRequest)
        ) as DivisionalChartRequest
      );
    },
  };
}

export function getAstrologyService(
  providerKey: AstrologyProviderKey = getDefaultAstrologyProviderKey()
) {
  return createAstrologyService(providerKey);
}

export function listAvailableAstrologyProviders() {
  return [
    "swisseph-vedic",
    ...(Object.keys(providerFactories) as Array<keyof typeof providerFactories>),
  ];
}
