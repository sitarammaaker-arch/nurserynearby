import Link from "next/link";
import Image from "next/image";
import NurseryImage from "@/components/ui/NurseryImage";
import { CATEGORIES, CITIES } from "@/lib/utils";

/* ─── Star Rating ─── */
export function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const s = size === "lg" ? "w-5 h-5" : size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";
  return (
    <span className="inline-flex gap-0.5">
      {[1,2,3,4,5].map((n) => (
        <svg key={n} viewBox="0 0 24 24" className={`${s} transition-colors ${n <= rating ? "fill-amber-400" : n - 0.5 <= rating ? "fill-amber-200" : "fill-gray-200"}`}>
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
      ))}
    </span>
  );
}

/* ─── Nursery Card ─── */
interface NurseryCardProps {
  id: string; name: string; slug: string;
  address: string; area?: string | null; cityName: string;
  avgRating: number; totalReviews: number;
  phone?: string | null; primaryImage?: string | null;
  isFeatured?: boolean; isVerified?: boolean;
  categories?: string[]; tagline?: string | null;
  established?: number | null;
}

export function NurseryCard(props: NurseryCardProps) {
  const {
    name, slug, address, area, cityName, avgRating, totalReviews,
    phone, primaryImage, isFeatured, isVerified, categories = [], tagline, established,
  } = props;

  return (
    <article className={`group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${isFeatured ? "card-featured" : "card-hover"}`}>

      {/* Image */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-forest-50 to-sage-50 overflow-hidden">
        {primaryImage ? (
          <NurseryImage
            src={primaryImage}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl opacity-25">🌱</span>
          </div>
        )}

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/>
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          {isFeatured && <span className="badge badge-gold">⭐ Featured</span>}
          {isVerified && <span className="badge badge-green">✓ Verified</span>}
        </div>
        {established && (
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-2xs px-2 py-1 rounded-lg font-medium backdrop-blur-sm">
            Est. {established}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {categories.slice(0, 2).map((cat) => {
              const meta = CATEGORIES.find((c) => c.name === cat);
              return (
                <span key={cat} className="text-2xs font-semibold text-forest-600 bg-forest-50 px-2 py-0.5 rounded-full border border-forest-100">
                  {meta?.icon} {cat}
                </span>
              );
            })}
          </div>
        )}

        <Link href={`/listing/${slug}`} className="group/name">
          <h3 className="font-display font-bold text-gray-900 group-hover/name:text-forest transition-colors mb-1 line-clamp-1 text-lg leading-tight">{name}</h3>
        </Link>

        {tagline && <p className="text-xs text-sage-600 italic mb-2 line-clamp-1">{tagline}</p>}

        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-sage-400 shrink-0">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
          </svg>
          <span className="line-clamp-1">{area ? `${area}, ` : ""}{cityName}</span>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Stars rating={avgRating}/>
          <span className="text-sm font-bold text-gray-800">{avgRating > 0 ? avgRating.toFixed(1) : "New"}</span>
          {totalReviews > 0 && <span className="text-xs text-gray-400">({totalReviews} reviews)</span>}
        </div>

        <div className="flex gap-2 mt-auto">
          {phone && (
            <a href={`tel:${phone}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold
                         bg-forest-50 text-forest border border-forest-100
                         hover:bg-forest hover:text-white hover:border-forest transition-all">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              Call
            </a>
          )}
          <Link href={`/listing/${slug}`}
            className="flex-1 flex items-center justify-center py-2.5 rounded-xl text-xs font-bold
                       gradient-forest text-white hover:shadow-green transition-all">
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ─── Category Card ─── */
export function CategoryCard({ name, slug, icon, color, border, text, citySlug = "all", count }: {
  name: string; slug: string; icon: string; color: string; border: string; text: string;
  citySlug?: string; count?: number;
}) {
  return (
    <Link href={`/nursery/${citySlug}/${slug}`}
      className={`group relative flex flex-col items-center gap-3 p-6 rounded-2xl border bg-gradient-to-br ${color} ${border}
                  hover:scale-105 hover:shadow-card transition-all duration-200 overflow-hidden`}>
      <div className="text-4xl group-hover:scale-110 transition-transform duration-200">{icon}</div>
      <span className={`text-xs font-bold text-center leading-tight ${text}`}>{name}</span>
      {count !== undefined && <span className="text-2xs text-gray-400">{count}+ listings</span>}
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-colors rounded-2xl"/>
    </Link>
  );
}

/* ─── City Card ─── */
export function CityCard({ name, slug, state, emoji, nurseryCount, imageUrl }: {
  name: string; slug: string; state: string; emoji: string;
  nurseryCount?: number; imageUrl?: string | null;
}) {
  return (
    <Link href={`/nursery/${slug}`}
      className="group relative flex flex-col items-center justify-center gap-2 p-5 rounded-2xl bg-white border border-gray-100 shadow-soft text-center overflow-hidden hover:shadow-card hover:border-forest-100 hover:-translate-y-1 transition-all duration-300">
      {imageUrl && (
        <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
          <Image src={imageUrl} alt={name} fill className="object-cover"/>
        </div>
      )}
      <div className="relative">
        <span className="text-3xl group-hover:scale-110 transition-transform block mb-1">{emoji}</span>
        <span className="font-display font-bold text-gray-900 group-hover:text-forest block transition-colors">{name}</span>
        <span className="text-2xs text-gray-400 block">{state}</span>
        {nurseryCount !== undefined && (
          <span className="badge badge-green mt-2">{nurseryCount} Nurseries</span>
        )}
      </div>
    </Link>
  );
}

/* ─── Review Card ─── */
export function ReviewCard({ userName, rating, title, comment, createdAt }: {
  userName: string; rating: number; title?: string | null;
  comment?: string | null; createdAt: Date | string;
}) {
  const date = new Date(createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
  const initials = userName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div className="card p-5 hover:shadow-card transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full gradient-forest flex items-center justify-center text-white text-sm font-bold shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-gray-900 text-sm">{userName}</p>
            <span className="text-2xs text-gray-400">{date}</span>
          </div>
          <Stars rating={rating}/>
        </div>
      </div>
      {title && <p className="font-semibold text-gray-800 text-sm mb-1">{title}</p>}
      {comment && <p className="text-sm text-gray-600 leading-relaxed">{comment}</p>}
    </div>
  );
}

/* ─── Blog Card ─── */
export function BlogCard({ title, slug, excerpt, category, coverImage, publishedAt, readTime = 5 }: {
  title: string; slug: string; excerpt: string; category: string;
  coverImage?: string | null; publishedAt?: Date | string | null; readTime?: number;
}) {
  const date = publishedAt ? new Date(publishedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "";
  return (
    <article className="group card-hover overflow-hidden flex flex-col">
      <div className="relative aspect-[16/9] bg-gradient-to-br from-forest-50 to-sage-50 overflow-hidden">
        {coverImage
          ? <Image src={coverImage} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy"/>
          : <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-20">📝</div>}
        <div className="absolute top-3 left-3">
          <span className="badge badge-cream border-cream-300">{category}</span>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-2xs text-gray-400 mb-2 font-medium">
          {date && <span>{date}</span>}
          <span>·</span>
          <span>{readTime} min read</span>
        </div>
        <Link href={`/blog/${slug}`}>
          <h3 className="font-display font-bold text-gray-900 group-hover:text-forest transition-colors mb-2 line-clamp-2 leading-tight text-lg">{title}</h3>
        </Link>
        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{excerpt}</p>
        <Link href={`/blog/${slug}`} className="inline-flex items-center gap-1 text-forest text-sm font-semibold hover:gap-2 transition-all group/link">
          Read Article
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current transition-transform group-hover/link:translate-x-0.5"><path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg>
        </Link>
      </div>
    </article>
  );
}

/* ─── Search Bar ─── */
export function SearchBar({ large, defaultCity }: { large?: boolean; defaultCity?: string }) {
  return (
    <form action="/nursery/search" method="GET"
      className={`bg-white rounded-2xl shadow-lifted border border-gray-100 flex flex-col sm:flex-row ${large ? "p-2.5" : "p-2"} gap-2`}>
      <div className="flex items-center gap-3 flex-1 px-4 py-2">
        <svg viewBox="0 0 24 24" className={`fill-forest shrink-0 ${large ? "w-5 h-5" : "w-4 h-4"}`}>
          <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <input name="q" type="text" placeholder="Search plants, nurseries…"
          className={`w-full outline-none bg-transparent text-gray-700 placeholder-gray-400 font-body ${large ? "text-base" : "text-sm"}`}/>
      </div>
      <div className="hidden sm:block w-px bg-gray-100 self-stretch my-1"/>
      <div className="flex items-center gap-3 px-4 py-2">
        <svg viewBox="0 0 24 24" className={`fill-forest shrink-0 ${large ? "w-5 h-5" : "w-4 h-4"}`}>
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
        </svg>
        <select name="city" defaultValue={defaultCity ?? ""}
          className={`outline-none bg-transparent text-gray-700 cursor-pointer font-body ${large ? "text-base" : "text-sm"} min-w-[110px]`}>
          <option value="">All Cities</option>
          {CITIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
      </div>
      <button type="submit"
        className={`btn btn-primary shrink-0 ${large ? "px-8 py-3.5 text-base rounded-xl" : "px-5 py-2.5 text-sm"}`}>
        Search
      </button>
    </form>
  );
}
