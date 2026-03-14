import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import BlogPostActions from "./BlogPostActions";

export const metadata: Metadata = { title: "Blog Posts — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  let posts: any[] = [];
  try {
    posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch {}

  const published = posts.filter((p) => p.isPublished).length;
  const drafts    = posts.filter((p) => !p.isPublished).length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-forest-900">Blog Posts</h1>
          <p className="text-sm text-gray-500 mt-1">
            {published} published · {drafts} drafts
          </p>
        </div>
        <Link href="/admin/blog/new" className="btn btn-primary">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          Write New Post
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5 bg-forest-50 border-forest-100">
          <p className="text-2xs font-bold uppercase tracking-wider text-forest-500 mb-1">Total Posts</p>
          <p className="font-display text-3xl font-bold text-forest">{posts.length}</p>
        </div>
        <div className="card p-5 bg-green-50 border-green-100">
          <p className="text-2xs font-bold uppercase tracking-wider text-green-600 mb-1">Published</p>
          <p className="font-display text-3xl font-bold text-green-700">{published}</p>
        </div>
        <div className="card p-5 bg-amber-50 border-amber-100">
          <p className="text-2xs font-bold uppercase tracking-wider text-amber-600 mb-1">Drafts</p>
          <p className="font-display text-3xl font-bold text-amber-700">{drafts}</p>
        </div>
      </div>

      {/* Posts list */}
      {posts.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-6xl mb-4">✍️</div>
          <h2 className="font-display text-2xl font-bold text-gray-700 mb-2">No posts yet</h2>
          <p className="text-gray-500 mb-6">Write your first blog post to attract plant lovers.</p>
          <Link href="/admin/blog/new" className="btn btn-primary btn-lg">Write First Post</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-gray-50">
            {posts.map((post) => (
              <div key={post.id} className="flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors">

                {/* Cover thumbnail */}
                <div className="w-20 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-forest-50 to-sage-50 shrink-0">
                  {post.coverImage ? (
                    <Image src={post.coverImage} alt={post.title} width={80} height={56} className="object-cover w-full h-full"/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl opacity-40">📝</div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge text-2xs ${post.isPublished ? "badge-green" : "badge-gold"}`}>
                      {post.isPublished ? "✅ Published" : "📝 Draft"}
                    </span>
                    <span className="badge badge-cream text-2xs">{post.category}</span>
                    <span className="text-2xs text-gray-400">{post.readTime} min read</span>
                  </div>
                  <h3 className="font-display font-bold text-gray-900 truncate">{post.title}</h3>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{post.excerpt}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-2xs text-gray-400">
                      {post.publishedAt
                        ? `Published ${new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
                        : `Created ${new Date(post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
                    </span>
                    <span className="text-2xs text-gray-300">·</span>
                    <span className="text-2xs text-gray-400">👁 {post.viewCount ?? 0} views</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {post.isPublished && (
                    <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer"
                      className="btn btn-ghost btn-sm text-xs text-gray-500">
                      View ↗
                    </a>
                  )}
                  <Link href={`/admin/blog/edit/${post.id}`} className="btn btn-secondary btn-sm text-xs">
                    ✏️ Edit
                  </Link>
                  <BlogPostActions id={post.id} isPublished={post.isPublished} slug={post.slug} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
