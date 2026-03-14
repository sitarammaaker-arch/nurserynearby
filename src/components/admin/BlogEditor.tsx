"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ImageUploader from "@/components/ui/ImageUploader";

const CATEGORIES = [
  "Indoor Plants", "Outdoor Plants", "Fruit Plants", "Flower Plants",
  "Rare Plants", "Gardening Tips", "Seasonal", "Gift Ideas",
  "Nursery Spotlight", "Plant Care", "DIY & Crafts",
];

interface Post {
  id?:         string;
  title:       string;
  excerpt:     string;
  content:     string;
  category:    string;
  tags:        string[];
  coverImage:  string;
  isPublished: boolean;
  author:      string;
}

interface Props {
  initial?: Partial<Post> & { id?: string };
}

/* ── Rich Text Toolbar ── */
function ToolbarBtn({ icon, title, onClick }: { icon: string; title: string; onClick: () => void }) {
  return (
    <button type="button" title={title} onClick={onClick}
      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-700 text-sm font-bold transition-colors">
      {icon}
    </button>
  );
}

export default function BlogEditor({ initial }: Props) {
  const router  = useRouter();
  const isEdit  = !!initial?.id;

  const [form, setForm] = useState<Post>({
    title:       initial?.title       ?? "",
    excerpt:     initial?.excerpt     ?? "",
    content:     initial?.content     ?? "",
    category:    initial?.category    ?? "",
    tags:        initial?.tags        ?? [],
    coverImage:  initial?.coverImage  ?? "",
    isPublished: initial?.isPublished ?? false,
    author:      initial?.author      ?? "NurseryNearby Team",
  });

  const [tagInput, setTagInput]   = useState("");
  const [saving,   setSaving]     = useState(false);
  const [saved,    setSaved]      = useState("");
  const [error,    setError]      = useState("");
  const [preview,  setPreview]    = useState(false);
  const [wordCount,setWordCount]  = useState(0);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const set = (k: keyof Post, v: any) => setForm((f) => ({ ...f, [k]: v }));

  // Word count
  useEffect(() => {
    const words = form.content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, [form.content]);

  // Auto-generate excerpt from content
  useEffect(() => {
    if (!form.excerpt && form.content.length > 30) {
      const plain = form.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      set("excerpt", plain.slice(0, 160));
    }
  }, [form.content]);

  // Insert formatting at cursor
  const insertFormat = useCallback((before: string, after = "", placeholder = "") => {
    const ta = contentRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end   = ta.selectionEnd;
    const sel   = ta.value.slice(start, end) || placeholder;
    const newVal = ta.value.slice(0, start) + before + sel + after + ta.value.slice(end);
    set("content", newVal);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + sel.length);
    }, 10);
  }, []);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) {
      set("tags", [...form.tags, t]);
    }
    setTagInput("");
  };

  async function handleSave(publish?: boolean) {
    setError("");
    if (!form.title.trim())   { setError("Title is required");    return; }
    if (!form.content.trim()) { setError("Content is required");  return; }
    if (!form.category)       { setError("Category is required"); return; }

    setSaving(true);
    const body = { ...form, isPublished: publish ?? form.isPublished, id: initial?.id };

    try {
      const res  = await fetch("/api/admin/blog", {
        method:  isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");

      setSaved(publish ? "✅ Published!" : "✅ Saved as draft");
      setTimeout(() => setSaved(""), 3000);

      if (!isEdit) {
        router.push(`/admin/blog/edit/${data.post.id}`);
      } else {
        router.refresh();
        set("isPublished", body.isPublished);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  // Convert simple markdown-like syntax to HTML for preview
  const renderPreview = (md: string) => {
    return md
      .replace(/^# (.+)$/gm, "<h1>$1</h1>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g,     "<em>$1</em>")
      .replace(/\n\n/g,          "</p><p>")
      .replace(/^/,              "<p>")
      .replace(/$/,              "</p>");
  };

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-forest-900">
            {isEdit ? "Edit Post" : "Write New Post"}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {wordCount} words · ~{Math.max(1, Math.ceil(wordCount / 200))} min read
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saved  && <span className="text-sm font-semibold text-green-700">{saved}</span>}
          {error  && <span className="text-sm font-semibold text-red-600">⚠️ {error}</span>}
          <button type="button" onClick={() => setPreview(!preview)}
            className="btn btn-secondary btn-sm">
            {preview ? "✏️ Edit" : "👁 Preview"}
          </button>
          <button type="button" onClick={() => handleSave(false)} disabled={saving}
            className="btn btn-outline btn-sm disabled:opacity-50">
            {saving ? "Saving…" : "💾 Save Draft"}
          </button>
          <button type="button" onClick={() => handleSave(true)} disabled={saving}
            className="btn btn-primary btn-sm disabled:opacity-50">
            {saving ? "Publishing…" : form.isPublished ? "✅ Update" : "🚀 Publish"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — main editor */}
        <div className="lg:col-span-2 space-y-5">

          {/* Title */}
          <div className="card p-5">
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Post title…"
              className="w-full text-2xl font-display font-bold text-gray-900 outline-none placeholder-gray-300 bg-transparent border-none resize-none"
            />
          </div>

          {/* Content editor */}
          <div className="card overflow-hidden">

            {/* Toolbar */}
            <div className="flex items-center gap-0.5 px-3 py-2 border-b border-gray-100 bg-gray-50 flex-wrap">
              <ToolbarBtn icon="H2" title="Heading 2" onClick={() => insertFormat("\n## ", "\n", "Heading")} />
              <ToolbarBtn icon="H3" title="Heading 3" onClick={() => insertFormat("\n### ", "\n", "Heading")} />
              <div className="w-px h-5 bg-gray-200 mx-1"/>
              <ToolbarBtn icon="B"  title="Bold"      onClick={() => insertFormat("**", "**", "bold text")} />
              <ToolbarBtn icon="I"  title="Italic"    onClick={() => insertFormat("*",  "*",  "italic")} />
              <div className="w-px h-5 bg-gray-200 mx-1"/>
              <ToolbarBtn icon="•"  title="Bullet list"   onClick={() => insertFormat("\n- ", "", "List item")} />
              <ToolbarBtn icon="1." title="Numbered list" onClick={() => insertFormat("\n1. ", "", "List item")} />
              <div className="w-px h-5 bg-gray-200 mx-1"/>
              <ToolbarBtn icon="❝"  title="Blockquote"    onClick={() => insertFormat("\n> ", "\n", "Quote")} />
              <ToolbarBtn icon="—"  title="Divider"       onClick={() => insertFormat("\n\n---\n\n")} />
              <ToolbarBtn icon="🔗" title="Link"           onClick={() => insertFormat("[", "](https://)", "link text")} />
              <div className="ml-auto">
                <button type="button" onClick={() => setPreview(!preview)}
                  className={`text-xs px-3 py-1 rounded-lg font-semibold transition-all ${preview ? "bg-forest text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {preview ? "✏️ Edit" : "👁 Preview"}
                </button>
              </div>
            </div>

            {/* Editor / Preview */}
            {preview ? (
              <div className="p-6 prose-nursery min-h-[400px]"
                dangerouslySetInnerHTML={{ __html: renderPreview(form.content) }}/>
            ) : (
              <textarea
                ref={contentRef}
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
                placeholder={`Start writing your post here…\n\nTips:\n## Use double # for headings\n**Bold text** with asterisks\n*Italic* with single asterisks\n- Bullet points\n> Blockquotes`}
                className="w-full min-h-[420px] p-5 text-sm text-gray-800 leading-relaxed font-mono outline-none resize-none bg-white placeholder-gray-300"
              />
            )}
          </div>

          {/* Excerpt */}
          <div className="card p-5">
            <label className="label mb-2">Excerpt <span className="text-gray-400 normal-case font-normal text-xs">(shown in blog list & SEO description)</span></label>
            <textarea
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              rows={2}
              maxLength={200}
              placeholder="Brief summary of the post…"
              className="textarea"
            />
            <p className="text-2xs text-gray-400 text-right mt-1">{form.excerpt.length}/200</p>
          </div>
        </div>

        {/* Right — settings sidebar */}
        <div className="space-y-5">

          {/* Publish status */}
          <div className="card p-5">
            <h3 className="font-display font-bold text-forest-900 mb-4">Publish</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`badge text-2xs ${form.isPublished ? "badge-green" : "badge-gold"}`}>
                  {form.isPublished ? "✅ Published" : "📝 Draft"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Words</span>
                <span className="text-sm font-semibold text-gray-700">{wordCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Read time</span>
                <span className="text-sm font-semibold text-gray-700">{Math.max(1, Math.ceil(wordCount / 200))} min</span>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <button type="button" onClick={() => handleSave(true)} disabled={saving}
                className="btn btn-primary w-full justify-center disabled:opacity-50">
                {saving ? "Publishing…" : form.isPublished ? "✅ Update Published Post" : "🚀 Publish Now"}
              </button>
              <button type="button" onClick={() => handleSave(false)} disabled={saving}
                className="btn btn-outline w-full justify-center text-sm disabled:opacity-50">
                {saving ? "Saving…" : "💾 Save as Draft"}
              </button>
            </div>
          </div>

          {/* Category */}
          <div className="card p-5">
            <label className="label mb-2">Category <span className="text-red-500">*</span></label>
            <select value={form.category} onChange={(e) => set("category", e.target.value)} className="select w-full">
              <option value="">— Select category —</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Author */}
          <div className="card p-5">
            <label className="label mb-2">Author</label>
            <input value={form.author} onChange={(e) => set("author", e.target.value)}
              placeholder="NurseryNearby Team" className="input"/>
          </div>

          {/* Tags */}
          <div className="card p-5">
            <label className="label mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="Type and press Enter"
                className="input flex-1 text-sm"
              />
              <button type="button" onClick={addTag} className="btn btn-secondary btn-sm shrink-0">Add</button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.tags.map((tag) => (
                  <span key={tag} className="badge badge-cream flex items-center gap-1">
                    #{tag}
                    <button type="button" onClick={() => set("tags", form.tags.filter((t) => t !== tag))}
                      className="text-gray-400 hover:text-red-500 ml-0.5 font-bold text-xs">✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Cover Image */}
          <div className="card p-5">
            <label className="label mb-2">Cover Image</label>

            {/* URL input */}
            <input
              value={form.coverImage}
              onChange={(e) => set("coverImage", e.target.value)}
              placeholder="https://... or upload below"
              className="input text-sm mb-3"
            />

            {/* Preview */}
            {form.coverImage && (
              <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-gray-100">
                <Image src={form.coverImage} alt="Cover" fill className="object-cover"/>
                <button type="button" onClick={() => set("coverImage", "")}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full text-xs flex items-center justify-center hover:bg-black/70">
                  ✕
                </button>
              </div>
            )}

            {/* Upload via Cloudinary */}
            <ImageUploader
              value={form.coverImage ? [{ url: form.coverImage, publicId: "", thumbnail: form.coverImage }] : []}
              onChange={(imgs) => { if (imgs[0]) set("coverImage", imgs[0].url); }}
              maxImages={1}
              folder="blog"
              label=""
            />
          </div>

          {/* Back link */}
          <a href="/admin/blog" className="btn btn-ghost w-full justify-center text-sm text-gray-500">
            ← All Posts
          </a>
        </div>
      </div>
    </div>
  );
}
