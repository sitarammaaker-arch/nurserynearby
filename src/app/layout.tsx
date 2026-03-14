import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE } from "@/lib/utils";

export const viewport: Viewport = {
  width:            "device-width",
  initialScale:     1,
  themeColor:       "#1a3a2a",
  colorScheme:      "light",
};

export const metadata: Metadata = {
  metadataBase:  new URL(SITE.url),
  title: {
    default:  `${SITE.name} — Find Plant Nurseries Near You`,
    template: `%s | ${SITE.name}`,
  },
  description:   "India's premier plant nursery directory. Find verified nurseries for indoor plants, fruit plants, flower plants & garden supplies near you.",
  keywords: [
    "plant nursery near me", "nursery near me", "buy plants online India",
    "indoor plants nursery", "flower plants nursery", "fruit plants nursery",
    "garden store near me", "plant shop India", "nursery Delhi",
    "nursery Mumbai", "nursery Bangalore", "rare plants India",
    "wholesale nursery India", "garden supplies near me",
  ],
  authors:    [{ name: SITE.name, url: SITE.url }],
  creator:    SITE.name,
  publisher:  SITE.name,
  category:   "shopping",

  // Open Graph
  openGraph: {
    type:      "website",
    locale:    "en_IN",
    url:       SITE.url,
    siteName:  SITE.name,
    title:     `${SITE.name} — Find Plant Nurseries Near You`,
    description: "India's premier plant nursery directory. Find verified nurseries for indoor plants, fruit plants & more near you.",
    images: [{
      url:    `${SITE.url}/og.jpg`,
      width:  1200,
      height: 630,
      alt:    `${SITE.name} — India's Plant Nursery Directory`,
    }],
  },

  // Twitter
  twitter: {
    card:        "summary_large_image",
    site:        "@NurseryNearby",
    creator:     "@NurseryNearby",
    title:       `${SITE.name} — Find Plant Nurseries Near You`,
    description: "India's premier plant nursery directory.",
    images:      [`${SITE.url}/og.jpg`],
  },

  // Technical SEO
  robots: {
    index:            true,
    follow:           true,
    googleBot: {
      index:          true,
      follow:         true,
      "max-video-preview":  -1,
      "max-image-preview": "large",
      "max-snippet":       -1,
    },
  },

  // Verification (add your codes here)
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION ?? "",
    // yandex: "",
    // bing: "",
  },

  // App / PWA
  icons: {
    icon:             "/favicon.ico",
    shortcut:         "/favicon-16x16.png",
    apple:            "/apple-touch-icon.png",
  },
  manifest:   "/manifest.json",

  // Canonical
  alternates: {
    canonical: SITE.url,
    languages: { "en-IN": SITE.url },
  },
};

// JSON-LD Organization schema
const orgSchema = {
  "@context":   "https://schema.org",
  "@type":      "Organization",
  name:         SITE.name,
  url:          SITE.url,
  logo:         `${SITE.url}/logo.png`,
  description:  "India's premier plant nursery directory",
  contactPoint: {
    "@type":       "ContactPoint",
    email:         SITE.email,
    contactType:   "customer service",
    areaServed:    "IN",
    availableLanguage: ["English", "Hindi"],
  },
  sameAs: [
    `https://twitter.com/NurseryNearby`,
    `https://instagram.com/NurseryNearby`,
    `https://facebook.com/NurseryNearby`,
  ],
};

// JSON-LD WebSite + SearchAction schema
const websiteSchema = {
  "@context":  "https://schema.org",
  "@type":     "WebSite",
  name:        SITE.name,
  url:         SITE.url,
  description: "India's premier plant nursery directory",
  potentialAction: {
    "@type":       "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE.url}/nursery/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link rel="dns-prefetch" href="https://res.cloudinary.com"/>
        <link rel="dns-prefetch" href="https://maps.google.com"/>
        <meta name="geo.region"      content="IN"/>
        <meta name="geo.placename"   content="India"/>
        <meta name="language"        content="English"/>
        <meta name="revisit-after"   content="3 days"/>
        <meta name="rating"          content="general"/>
        <meta name="distribution"    content="global"/>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="font-body antialiased">
        {children}
      </body>
    </html>
  );
}
