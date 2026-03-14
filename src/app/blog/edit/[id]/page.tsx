import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BlogEditor from "@/components/admin/BlogEditor";

interface Props { params: { id: string } }

export const metadata: Metadata = { title: "Edit Post — Admin" };
export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({ params }: Props) {
  let post: any = null;
  try {
    post = await prisma.blogPost.findUnique({ where: { id: params.id } });
  } catch {}

  if (!post) notFound();

  return (
    <BlogEditor
      initial={{
        id:          post.id,
        title:       post.title,
        excerpt:     post.excerpt,
        content:     post.content,
        category:    post.category,
        tags:        post.tags,
        coverImage:  post.coverImage ?? "",
        isPublished: post.isPublished,
        author:      post.author,
      }}
    />
  );
}
