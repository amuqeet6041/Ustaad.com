/**
 * Display helpers for backend enum values and common marketplace UI strings.
 *
 * Backend enums use lowercase snake_case (e.g. "test_prep"). The helpers
 * here convert them into human-readable labels without fabricating values.
 */

import type { GigCategory, GigPackage, GigPackageTier, Gig, TeachingMode } from "@/services/gigService";

const CATEGORY_LABELS: Record<string, string> = {
  stem: "STEM",
  programming: "Programming",
  languages: "Languages",
  test_prep: "Test Prep",
  commerce_business: "Commerce & Business",
  arts_humanities: "Arts & Humanities",
};

const TEACHING_MODE_LABELS: Record<string, string> = {
  online: "Online",
  in_person: "In-Person",
  both: "Online & In-Person",
};

const TIER_LABELS: Record<string, string> = {
  basic: "Basic",
  standard: "Standard",
  premium: "Premium",
};

/** Human-readable category label (e.g. "test_prep" → "Test Prep"). */
export function formatCategory(category: GigCategory | string | null | undefined): string {
  if (!category) return "General";
  return CATEGORY_LABELS[category] ?? category;
}

/** Human-readable teaching mode label (e.g. "in_person" → "In-Person"). */
export function formatTeachingMode(mode: TeachingMode | string | null | undefined): string {
  if (!mode) return "—";
  return TEACHING_MODE_LABELS[mode] ?? mode;
}

/** Capitalised tier name (e.g. "basic" → "Basic"). */
export function formatTier(tier: GigPackageTier | string): string {
  return TIER_LABELS[tier] ?? tier.charAt(0).toUpperCase() + tier.slice(1);
}

/** Format a price as "Rs. X,XXX" or return null when price is absent. */
export function formatPrice(price: number | null | undefined): string | null {
  if (price == null) return null;
  return `Rs. ${price.toLocaleString("en-PK")}`;
}

/** Extract two-letter initials from a name. */
export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

/** Derive the cheapest available price for a gig.
 *  Returns the lowest package price when packages exist, falling back to the
 *  top-level gig.price. Returns null when no price is available. */
export function getStartingPrice(gig: Gig): number | null {
  const pkgPrices = gig.packages
    .map((p) => p.price)
    .filter((p): p is number => p != null);
  if (pkgPrices.length > 0) return Math.min(...pkgPrices);
  return gig.price ?? null;
}

/** Return the package with a given tier, or null. */
export function getPackageByTier(gig: Gig, tier: GigPackageTier): GigPackage | null {
  return gig.packages.find((p) => p.tier === tier) ?? null;
}