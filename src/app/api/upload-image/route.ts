import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file     = formData.get("file") as File;
    const folder   = (formData.get("folder") as string) ?? "nurseries";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate type
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG and WebP allowed" }, { status: 400 });
    }

    // Validate size — max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
    }

    const cloudName    = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || "nurserynearby";

    if (!cloudName) {
      return NextResponse.json({
        error: "Cloudinary not configured — add CLOUDINARY_CLOUD_NAME to Vercel env vars and redeploy",
        debug: {
          cloudName:    cloudName ?? "missing",
          uploadPreset: uploadPreset,
        }
      }, { status: 500 });
    }

    // Convert to base64
    const bytes   = await file.arrayBuffer();
    const base64  = Buffer.from(bytes).toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    const body = new FormData();
    body.append("file",          dataUri);
    body.append("upload_preset", uploadPreset);
    body.append("folder",        folder);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({
        error: data.error?.message ?? "Cloudinary upload failed",
        cloudinaryError: data.error,
      }, { status: 500 });
    }

    return NextResponse.json({
      success:   true,
      url:       data.secure_url,
      publicId:  data.public_id,
      width:     data.width,
      height:    data.height,
      format:    data.format,
      thumbnail: data.secure_url.replace("/upload/", "/upload/w_400,h_300,c_fill,q_auto/"),
    });

  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err.message ?? "Upload failed" }, { status: 500 });
  }
}
