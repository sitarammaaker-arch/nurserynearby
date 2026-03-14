import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyNewBlogPost } from "@/lib/whatsapp";

function makeSlug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function readTime(content: string) {
  const words = content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

// GET — list all posts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  try {
    if (id) {
      const post = await prisma.blogPost.findUnique({ where: { id } });
      if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ post });
    }

    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true, title: true, slug: true, category: true,
        isPublished: true, publishedAt: true, readTime: true,
        viewCount: true, createdAt: true, updatedAt: true,
        coverImage: true, excerpt: true,
      },
    });
    return NextResponse.json({ posts });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST — create new post
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, excerpt, category, tags, coverImage, isPublished, author } = body;

    if (!title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });
    if (!content?.trim()) return NextResponse.json({ error: "Content is required" }, { status: 400 });
    if (!category?.trim()) return NextResponse.json({ error: "Category is required" }, { status: 400 });

    // Generate unique slug
    let slug = makeSlug(title);
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const post = await prisma.blogPost.create({
      data: {
        title:       title.trim(),
        slug,
        content:     content.trim(),
        excerpt:     excerpt?.trim() || title.trim().slice(0, 160),
        category:    category.trim(),
        tags:        Array.isArray(tags) ? tags : [],
        coverImage:  coverImage?.trim() || null,
        isPublished: isPublished === true,
        publishedAt: isPublished ? new Date() : null,
        readTime:    readTime(content),
        author:      author?.trim() || "NurseryNearby Team",
      },
    });

    // Notify if published
    if (isPublished) {
      notifyNewBlogPost({ title: post.title, category: post.category, slug: post.slug }).catch(console.error);
    }

    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT — update existing post
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, content, excerpt, category, tags, coverImage, isPublished, author } = body;

    if (!id) return NextResponse.json({ error: "Post ID required" }, { status: 400 });

    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    // Only set publishedAt if newly publishing
    const publishedAt = isPublished && !existing.isPublished ? new Date() : existing.publishedAt;

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        title:       title?.trim() || existing.title,
        content:     content?.trim() || existing.content,
        excerpt:     excerpt?.trim() || existing.excerpt,
        category:    category?.trim() || existing.category,
        tags:        Array.isArray(tags) ? tags : existing.tags,
        coverImage:  coverImage?.trim() || existing.coverImage,
        isPublished: isPublished === true,
        publishedAt,
        readTime:    content ? readTime(content) : existing.readTime,
        author:      author?.trim() || existing.author,
      },
    });

    // Notify if newly published
    if (isPublished && !existing.isPublished) {
      notifyNewBlogPost({ title: post.title, category: post.category, slug: post.slug }).catch(console.error);
    }

    return NextResponse.json({ success: true, post });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE — delete a post
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    await prisma.blogPost.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
