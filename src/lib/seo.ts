import type { Metadata } from "next";
import { SITE, CATEGORIES } from "@/lib/utils";

/* ── City page metadata ── */
export function cityPageMeta(cityName: string, citySlug: string, nurseryCount = 0): Metadata {
  const title = `Plant Nursery in ${cityName} — Buy Plants & Garden Supplies`;
  const desc  = `Find ${nurseryCount > 0 ? nurseryCount + "+" : "top"} verified plant nurseries in ${cityName}. Browse indoor plants, fruit plants, flower plants & garden supplies. Compare ratings, get directions & contact directly.`;
  const keywords = [
    `plant nursery in ${cityName}`,
    `nursery in ${cityName}`,
    `buy plants in ${cityName}`,
    `indoor plants ${cityName}`,
    `flower plants ${cityName}`,
    `fruit plants ${cityName}`,
    `garden store ${cityName}`,
    `plant shop ${cityName}`,
    `nursery near me ${cityName}`,
  ];

  return {
    title,
    description:  desc,
    keywords,
    alternates: { canonical: `${SITE.url}/nursery/${citySlug}` },
    openGraph: {
      title,
      description: desc,
      url:         `${SITE.url}/nursery/${citySlug}`,
      type:        "website",
    },
    twitter: { card: "summary", title, description: desc },
  };
}

/* ── City + Category page metadata ── */
export function cityCategoryPageMeta(cityName: string, citySlug: string, catName: string, catSlug: string, count = 0): Metadata {
  const title = `${catName} in ${cityName} — Buy ${catName} Near You`;
  const desc  = `Find the best ${catName.toLowerCase()} nurseries in ${cityName}. ${count > 0 ? count + " nurseries" : "Verified listings"} with ratings, photos & direct contact. Get ${catName.toLowerCase()} delivered or visit the store.`;
  const keywords = [
    `${catName.toLowerCase()} in ${cityName}`,
    `buy ${catName.toLowerCase()} ${cityName}`,
    `${catName.toLowerCase()} nursery ${cityName}`,
    `best ${catName.toLowerCase()} ${cityName}`,
    `${catName.toLowerCase()} near me`,
  ];

  return {
    title,
    description:  desc,
    keywords,
    alternates: { canonical: `${SITE.url}/nursery/${citySlug}/${catSlug}` },
    openGraph: {
      title,
      description: desc,
      url:         `${SITE.url}/nursery/${citySlug}/${catSlug}`,
    },
  };
}

/* ── Nursery listing page metadata ── */
export function listingPageMeta(params: {
  name:        string;
  slug:        string;
  cityName:    string;
  citySlug:    string;
  description: string | null;
  categories:  string[];
  avgRating:   number;
  totalReviews:number;
  photoUrl?:   string | null;
}): Metadata {
  const { name, slug, cityName, citySlug, description, categories, avgRating, totalReviews, photoUrl } = params;
  const catStr = categories.slice(0, 2).join(", ");
  const title  = `${name} — Plant Nursery in ${cityName}`;
  const desc   = description?.slice(0, 160)
    ?? `Visit ${name} in ${cityName}${catStr ? ` — ${catStr}` : ""}. ${totalReviews > 0 ? `Rated ${avgRating.toFixed(1)}★ by ${totalReviews} customers.` : "Find plants, get directions & contact directly."}`;

  const keywords = [
    name,
    `${name} ${cityName}`,
    `nursery in ${cityName}`,
    ...categories.map((c) => `${c} ${cityName}`),
    `plant nursery ${cityName}`,
  ];

  return {
    title,
    description:  desc,
    keywords,
    alternates: { canonical: `${SITE.url}/listing/${slug}` },
    openGraph: {
      title,
      description: desc,
      url:         `${SITE.url}/listing/${slug}`,
      type:        "website",
      images:      photoUrl ? [{ url: photoUrl, width: 1200, height: 630, alt: name }] : [],
    },
    twitter: {
      card:        photoUrl ? "summary_large_image" : "summary",
      title,
      description: desc,
      images:      photoUrl ? [photoUrl] : [],
    },
  };
}

/* ── Blog post metadata ── */
export function blogPostMeta(params: {
  title:       string;
  slug:        string;
  excerpt:     string;
  category:    string;
  tags:        string[];
  coverImage?: string | null;
  author:      string;
  publishedAt?: Date | null;
}): Metadata {
  const { title, slug, excerpt, category, tags, coverImage, author, publishedAt } = params;

  return {
    title:        `${title} — ${SITE.name} Blog`,
    description:  excerpt,
    keywords:     [category, ...tags, "plant care", "gardening India", "nursery tips"],
    authors:      [{ name: author }],
    alternates: { canonical: `${SITE.url}/blog/${slug}` },
    openGraph: {
      title,
      description:   excerpt,
      url:           `${SITE.url}/blog/${slug}`,
      type:          "article",
      publishedTime: publishedAt?.toISOString(),
      authors:       [author],
      tags:          [category, ...tags],
      images:        coverImage ? [{ url: coverImage, width: 1200, height: 630, alt: title }] : [],
    },
    twitter: {
      card:        "summary_large_image",
      title,
      description: excerpt,
      images:      coverImage ? [coverImage] : [],
    },
  };
}

/* ── JSON-LD for nursery listing ── */
export function listingSchema(nursery: any) {
  return {
    "@context":  "https://schema.org",
    "@type":     "LocalBusiness",
    "@id":       `${SITE.url}/listing/${nursery.slug}`,
    name:         nursery.name,
    description:  nursery.description ?? "",
    url:          nursery.website ?? `${SITE.url}/listing/${nursery.slug}`,
    telephone:    nursery.phone,
    email:        nursery.email,
    image:        nursery.photos?.map((p: any) => p.url) ?? [],
    priceRange:   "₹₹",
    address: {
      "@type":          "PostalAddress",
      streetAddress:    nursery.address,
      addressLocality:  nursery.city?.name,
      addressRegion:    nursery.city?.state,
      postalCode:       nursery.pincode ?? "",
      addressCountry:   "IN",
    },
    ...(nursery.latitude && nursery.longitude && {
      geo: {
        "@type":    "GeoCoordinates",
        latitude:   nursery.latitude,
        longitude:  nursery.longitude,
      },
      hasMap: `https://maps.google.com/?q=${nursery.latitude},${nursery.longitude}`,
    }),
    ...(nursery.openingHours && {
      openingHours: nursery.openingHours,
    }),
    ...(nursery.totalReviews > 0 && {
      aggregateRating: {
        "@type":       "AggregateRating",
        ratingValue:   nursery.avgRating.toFixed(1),
        reviewCount:   nursery.totalReviews,
        bestRating:    "5",
        worstRating:   "1",
      },
    }),
    ...(nursery.reviews?.length > 0 && {
      review: nursery.reviews.slice(0, 5).map((r: any) => ({
        "@type":       "Review",
        reviewRating: {
          "@type":       "Rating",
          ratingValue:   r.rating,
          bestRating:    "5",
        },
        author: {
          "@type": "Person",
          name:    r.user?.name ?? "Anonymous",
        },
        reviewBody:   r.comment ?? "",
        datePublished: r.createdAt,
      })),
    }),
  };
}

/* ── JSON-LD for blog post ── */
export function blogSchema(post: any) {
  return {
    "@context":           "https://schema.org",
    "@type":              "Article",
    headline:             post.title,
    description:          post.excerpt,
    image:                post.coverImage ?? `${SITE.url}/og.jpg`,
    datePublished:        post.publishedAt,
    dateModified:         post.updatedAt,
    author: {
      "@type": "Organization",
      name:    SITE.name,
      url:     SITE.url,
    },
    publisher: {
      "@type": "Organization",
      name:    SITE.name,
      url:     SITE.url,
      logo: {
        "@type": "ImageObject",
        url:     `${SITE.url}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id":   `${SITE.url}/blog/${post.slug}`,
    },
    keywords: post.tags?.join(", "),
    articleSection: post.category,
  };
}

/* ── JSON-LD BreadcrumbList ── */
export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type":    "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type":   "ListItem",
      position:  i + 1,
      name:      item.name,
      item:      item.url,
    })),
  };
}
