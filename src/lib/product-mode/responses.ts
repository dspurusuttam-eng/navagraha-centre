import { NextResponse } from "next/server";
import { featureDisabledCode, type ProductRouteDisposition } from "@/config/product-mode";

export const featureDisabledStatus = 403;

export function createFeatureDisabledApiResponse(feature: string, status = featureDisabledStatus) {
  return NextResponse.json(
    {
      ok: false,
      code: featureDisabledCode,
      feature,
      message: "This feature is disabled while NAVAGRAHA CENTRE is in Desk and Consultation launch mode.",
    },
    {
      status,
      headers: {
        "cache-control": "no-store",
        "x-robots-tag": "noindex, nofollow",
      },
    }
  );
}

export function createFeatureDisabledPageResponse(
  disposition: ProductRouteDisposition,
  status = 404
) {
  return new NextResponse("Feature unavailable in Desk and Consultation launch mode.", {
    status,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
      "x-navagraha-product-mode": disposition,
    },
  });
}
