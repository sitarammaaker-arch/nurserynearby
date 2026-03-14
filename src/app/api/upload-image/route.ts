import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file     = formData.get("file") as File;
    const folder   = (formData.get("folder") as string) ?? "nurseries";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG and WebP images allowed" }, { status: 400 });
    }

    // Validate file size — max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET ?? "nurserynearby";

    if (!cloudName) {
      return NextResponse.json({ error: "Cloudinary not configured" }, { status: 500 });
    }

    // Convert file to base64
    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary using unsigned upload preset
    const uploadData = new FormData();
    uploadData.append("file",           dataUri);
    uploadData.append("upload_preset",  uploadPreset);
    uploadData.append("folder",         folder);
    uploadData.append("transformation", "q_auto,f_auto,w_1200,h_900,c_limit");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: uploadData }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message ?? "Cloudinary upload failed");
    }

    const data = await res.json();

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
