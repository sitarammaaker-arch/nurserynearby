/**
 * WhatsApp Notifications via CallMeBot (Free)
 * Setup: https://www.callmebot.com/blog/free-api-whatsapp-messages/
 *
 * Steps to activate (one time only):
 * 1. Save +34 644 59 21 91 in your phone as "CallMeBot"
 * 2. Send this WhatsApp message to that number:
 *    I allow callmebot to send me messages
 * 3. You'll receive your API key in reply
 * 4. Add to .env:
 *    WHATSAPP_PHONE="919810000000"   (your number with country code, no +)
 *    WHATSAPP_APIKEY="1234567"       (key received from CallMeBot)
 */

interface NotifyNewNurseryParams {
  name:      string;
  phone:     string;
  city:      string;
  address:   string;
  slug:      string;
  category?: string;
}

interface NotifyNewBlogParams {
  title:    string;
  category: string;
  slug:     string;
}

function buildMessage(text: string): string {
  return encodeURIComponent(text);
}

async function sendWhatsApp(message: string): Promise<boolean> {
  const phone  = process.env.WHATSAPP_PHONE;
  const apiKey = process.env.WHATSAPP_APIKEY;

  if (!phone || !apiKey) {
    console.log("WhatsApp not configured — skipping notification");
    return false;
  }

  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${buildMessage(message)}&apikey=${apiKey}`;
    const res = await fetch(url, { method: "GET" });
    if (res.ok) {
      console.log("✅ WhatsApp notification sent");
      return true;
    } else {
      console.error("WhatsApp API error:", res.status);
      return false;
    }
  } catch (err) {
    console.error("WhatsApp send failed:", err);
    return false;
  }
}

/* ── Notification Templates ── */

export async function notifyNewNursery(params: NotifyNewNurseryParams) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nurserynearby.vercel.app";
  const message = [
    "🌿 *New Nursery Submitted!*",
    "",
    `📛 *Name:* ${params.name}`,
    `📍 *City:* ${params.city}`,
    `📞 *Phone:* ${params.phone}`,
    `🏠 *Address:* ${params.address}`,
    params.category ? `🏷️ *Category:* ${params.category}` : "",
    "",
    `🔗 View: ${siteUrl}/listing/${params.slug}`,
    `✅ Approve: ${siteUrl}/admin/listings`,
    "",
    `⏰ ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })} IST`,
  ].filter(Boolean).join("\n");

  return sendWhatsApp(message);
}

export async function notifyBulkUpload(count: number, success: number, failed: number, batchId: string) {
  const message = [
    "📤 *Bulk Upload Complete!*",
    "",
    `✅ *Imported:* ${success} nurseries`,
    failed > 0 ? `❌ *Failed:* ${failed} rows` : "",
    `📊 *Total:* ${count} rows`,
    `🆔 *Batch:* ${batchId.slice(0, 8)}`,
    "",
    `🔗 View: ${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/admin/listings`,
    `⏰ ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })} IST`,
  ].filter(Boolean).join("\n");

  return sendWhatsApp(message);
}

export async function notifyNewBlogPost(params: NotifyNewBlogParams) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nurserynearby.vercel.app";
  const message = [
    "📝 *New Blog Post Published!*",
    "",
    `📰 *Title:* ${params.title}`,
    `🏷️ *Category:* ${params.category}`,
    "",
    `🔗 Read: ${siteUrl}/blog/${params.slug}`,
    `⏰ ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })} IST`,
  ].join("\n");

  return sendWhatsApp(message);
}

export async function notifyTestMessage() {
  const message = [
    "✅ *NurseryNearby Notifications Active!*",
    "",
    "WhatsApp alerts are working correctly.",
    `🌿 Site: ${process.env.NEXT_PUBLIC_SITE_URL ?? ""}`,
    `⏰ ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })} IST`,
  ].join("\n");

  return sendWhatsApp(message);
}
