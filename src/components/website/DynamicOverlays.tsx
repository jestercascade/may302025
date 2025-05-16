"use client";

import dynamic from "next/dynamic";

export const SizeChartOverlay = dynamic(
  () => import("@/components/website/ProductDetails/SizeChartOverlay").then((mod) => mod.SizeChartOverlay),
  { ssr: false }
);

export const UpsellReviewOverlay = dynamic(
  () => import("@/components/website/UpsellReviewOverlay").then((mod) => mod.UpsellReviewOverlay),
  { ssr: false }
);
