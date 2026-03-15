import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function formatPhone(raw: string): string {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (!digits) return raw;

  // 12-digit with 91 prefix → strip country code, format local
  let local = digits;
  if (digits.startsWith("91") && digits.length === 12) {
    local = digits.slice(2);
  } else if (digits.startsWith("0") && digits.length === 11) {
    local = digits.slice(1);
  }

  // 10-digit Indian mobile → +91 98101 23456
  if (local.length === 10) {
    return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
  }

  // Already has + prefix
  if (raw.startsWith("+")) return raw;

  // Starts with 91 but odd length → add +
  if (digits.startsWith("91")) return `+${digits}`;

  return raw;
}

export const SITE = {
  name:    "NurseryNearby",
  tagline: "India's Premier Plant Nursery Directory",
  desc:    "Discover the finest plant nurseries, rare botanicals & garden experts near you.",
  url:     process.env.NEXT_PUBLIC_SITE_URL || "https://nurserynearby.in",
  email:   "hello@nurserynearby.in",
  phone:   "+91-9810000000",
};

export const CATEGORIES = [
  { name: "Indoor Plants",        slug: "indoor-plants",        icon: "🪴", color: "from-emerald-50 to-green-50",   border: "border-emerald-200",   text: "text-emerald-800" },
  { name: "Fruit Plants",         slug: "fruit-plants",         icon: "🍋", color: "from-amber-50 to-yellow-50",   border: "border-amber-200",    text: "text-amber-800"   },
  { name: "Flower Plants",        slug: "flower-plants",        icon: "🌸", color: "from-pink-50 to-rose-50",      border: "border-pink-200",     text: "text-pink-800"    },
  { name: "Wholesale Nursery",    slug: "wholesale-nursery",    icon: "🏭", color: "from-blue-50 to-sky-50",       border: "border-blue-200",     text: "text-blue-800"    },
  { name: "Garden Supplies",      slug: "garden-supplies",      icon: "🧰", color: "from-orange-50 to-amber-50",   border: "border-orange-200",   text: "text-orange-800"  },
  { name: "Landscaping",          slug: "landscaping",          icon: "🌿", color: "from-teal-50 to-cyan-50",      border: "border-teal-200",     text: "text-teal-800"    },
  { name: "Rare & Exotic Plants", slug: "rare-exotic-plants",   icon: "🌺", color: "from-purple-50 to-violet-50",  border: "border-purple-200",   text: "text-purple-800"  },
  { name: "Succulents & Cactus",  slug: "succulents-cactus",    icon: "🌵", color: "from-lime-50 to-green-50",     border: "border-lime-200",     text: "text-lime-800"    },
];

export const CITIES = [
  { name: "Delhi",        slug: "delhi",        state: "Delhi",         emoji: "🏛️" },
  { name: "Mumbai",       slug: "mumbai",       state: "Maharashtra",   emoji: "🌊" },
  { name: "Bangalore",    slug: "bangalore",    state: "Karnataka",     emoji: "🌳" },
  { name: "Chandigarh",   slug: "chandigarh",   state: "Punjab",        emoji: "🌹" },
  { name: "Jaipur",       slug: "jaipur",       state: "Rajasthan",     emoji: "🏰" },
  { name: "Ludhiana",     slug: "ludhiana",     state: "Punjab",        emoji: "🌾" },
  { name: "Panipat",      slug: "panipat",      state: "Haryana",       emoji: "🌿" },
  { name: "Pune",         slug: "pune",         state: "Maharashtra",   emoji: "⛰️" },
  { name: "Hyderabad",    slug: "hyderabad",    state: "Telangana",     emoji: "💎" },
  { name: "Ahmedabad",    slug: "ahmedabad",    state: "Gujarat",       emoji: "🏺" },
  { name: "Chennai",      slug: "chennai",      state: "Tamil Nadu",    emoji: "🌴" },
  { name: "Kolkata",      slug: "kolkata",      state: "West Bengal",   emoji: "🌺" },
];

export const BULK_UPLOAD_TEMPLATE_HEADERS = [
  "name", "phone", "phone2", "whatsapp", "email", "website",
  "address", "area", "landmark", "pincode", "city",
  "categories", "description", "tagline", "openingHours",
  "closedOn", "established", "latitude", "longitude",
  "isFeatured", "isVerified", "primaryImageUrl",
];

export const BULK_UPLOAD_SAMPLE_ROW = [
  "Green Paradise Nursery", "+91-9810123456", "", "+919810123456",
  "info@greenparadise.in", "https://greenparadise.in",
  "15 Model Town Phase 2", "Model Town", "Near Metro Station",
  "110009", "Delhi",
  "Indoor Plants|Flower Plants", "Premium plant nursery in Delhi",
  "Where plants find their home", "Mon-Sun 8AM-8PM",
  "", "1998", "28.7041", "77.1025",
  "true", "true",
  "https://images.unsplash.com/photo-1585320806297-9794b3e4aaae?w=800&q=80",
];
