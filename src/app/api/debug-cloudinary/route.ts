import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    CLOUDINARY_CLOUD_NAME:    process.env.CLOUDINARY_CLOUD_NAME    ?? "❌ NOT SET",
    CLOUDINARY_UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET ?? "❌ NOT SET",
    NODE_ENV: process.env.NODE_ENV,
  });
}
