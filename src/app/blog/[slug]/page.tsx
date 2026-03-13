import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { prisma } from "@/lib/prisma";
import { SITE } from "@/lib/utils";

interface Props { params: { slug: string } }

const DEMO_POSTS: Record<string, any> = {
  "indoor-plants-indian-apartments": {
    id:"b1", title:"10 Indoor Plants That Thrive in Indian Apartments",
    slug:"indoor-plants-indian-apartments",
    excerpt:"From peace lilies to pothos — discover the best low-maintenance plants for every room.",
    category:"Indoor Plants",
    coverImage:"https://images.unsplash.com/photo-1545241047-6083a3684587?w=1400&q=85",
    publishedAt:new Date("2025-03-08"), readTime:5, author:"NurseryNearby Team",
    tags:["indoor plants","apartment","India"],
    content:`<h2>Why Indoor Plants Are Thriving in Indian Homes</h2>
<p>The pandemic changed everything about how Indians relate to their living spaces. With more time spent at home, plants stopped being a luxury and became a necessity — for mental wellness, air quality, and aesthetic joy.</p>
<p>But not all plants survive India's unique combination of heat, monsoon humidity, and often limited natural light in urban apartments. Here's our curated list of the 10 best performers.</p>
<h2>1. Peace Lily (Spathiphyllum)</h2>
<p>The gold standard for indoor plants across India. Peace lilies tolerate low light, irregular watering, and air conditioning beautifully. Their elegant white spathes bloom even in north-facing rooms.</p>
<h2>2. Pothos (Epipremnum aureum — Money Plant)</h2>
<p>India's most popular indoor plant for good reason. Nearly impossible to kill, pothos grows aggressively in any light condition. The trailing vines look stunning on high shelves or in hanging planters.</p>
<h2>3. Snake Plant (Sansevieria trifasciata)</h2>
<p>An architectural statement piece that converts CO₂ to oxygen even at night — making it ideal for bedrooms. Requires watering just once in 2–3 weeks. Perfect for frequent travellers.</p>
<h2>4. ZZ Plant (Zamioculcas zamiifolia)</h2>
<p>If you have low light and a tendency to forget watering, the ZZ plant is your answer. The glossy, dark green leaves are architectural and beautiful.</p>
<h2>5. Spider Plant (Chlorophytum comosum)</h2>
<p>One of the best air purifiers proven by NASA. The cascading white-striped leaves and cheerful "babies" make spider plants delightful for hanging baskets in kitchens and bathrooms.</p>
<h2>Buying Tip</h2>
<p>Always inspect the root health before buying. A healthy root system — white or pale tan coloured, firm to the touch — is far more important than how the leaves look in the shop.</p>`,
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = DEMO_POSTS[params.slug];
  if (!post) return { title: "Post Not Found" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `${SITE.url}/blog/${params.slug}` },
    openGraph: { title: post.title, description: post.excerpt, images: post.coverImage ? [post.coverImage] : [] },
  };
}

export default async function BlogPostPage({ params }: Props) {
  let post: any = null;
  try {
    post = await prisma.blogPost.findUnique({ where: { slug: params.slug, isPublished: true } });
  } catch {}
  if (!post) post = DEMO_POSTS[params.slug];
  if (!post) notFound();

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    author: { "@type": "Organization", name: SITE.name },
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Navbar />
      <main>
        {/* Cover image */}
        <div className="relative h-72 sm:h-96 bg-forest-50">
          {post.coverImage && (
            <Image src={post.coverImage} alt={post.title} fill className="object-cover" priority />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        <article className="container max-w-3xl py-10">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="badge badge-green">{post.category}</span>
            {post.publishedAt && (
              <span className="text-sm text-gray-400">
                {new Date(post.publishedAt).toLocaleDateString("en-IN", { year:"numeric", month:"long", day:"numeric" })}
              </span>
            )}
            <span className="text-gray-300">·</span>
            <span className="text-sm text-gray-400">{post.readTime} min read</span>
            <span className="text-gray-300">·</span>
            <span className="text-sm text-gray-500">By {post.author}</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-bold text-forest-900 leading-tight mb-4">{post.title}</h1>
          <p className="text-xl text-gray-500 leading-relaxed mb-10 font-light">{post.excerpt}</p>

          {/* Content */}
          <div className="prose-nursery" dangerouslySetInnerHTML={{ __html: post.content }} />

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="mt-12 pt-6 border-t border-gray-100 flex flex-wrap gap-2">
              {post.tags.map((tag: string) => (
                <span key={tag} className="badge badge-cream">#{tag}</span>
              ))}
            </div>
          )}

          {/* Back + Share */}
          <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between">
            <a href="/blog" className="btn btn-outline btn-sm">← All Articles</a>
            <div className="flex gap-2">
              <a href={`https://wa.me/?text=${encodeURIComponent(post.title + " " + SITE.url + "/blog/" + post.slug)}`}
                target="_blank" rel="noopener noreferrer"
                className="btn btn-sm" style={{ background:"#25D366", color:"white" }}>
                Share
              </a>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
