import { authorized, sameOrigin, fail } from "../../../lib/studio";
import { uploadImageKitFile } from "../../../lib/imagekit";

export async function POST(req: Request) {
  try {
    if (!sameOrigin(req) || !await authorized(req)) {
      return fail("Studio sign-in required", 403);
    }

    const size = Number(req.headers.get("content-length"));
    if (!size || size > 32 * 1024 * 1024) {
      return fail("Maximum file size is 32 MB", 413);
    }

    const data = await req.arrayBuffer();
    if (data.byteLength > 32 * 1024 * 1024) {
      return fail("Maximum file size is 32 MB", 413);
    }

    const bytes = new Uint8Array(data);
    const signature = new TextDecoder("latin1").decode(bytes.slice(0, 16));
    let mime = "";
    if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) mime = "image/jpeg";
    else if (bytes[0] === 137 && signature.slice(1, 4) === "PNG") mime = "image/png";
    else if (signature.startsWith("GIF8")) mime = "image/gif";
    else if (signature.startsWith("RIFF") && signature.slice(8, 12) === "WEBP") mime = "image/webp";
    else if (signature.slice(4, 8) === "ftyp") mime = "video/mp4";
    else if (bytes[0] === 26 && bytes[1] === 69 && bytes[2] === 223 && bytes[3] === 163) mime = "video/webm";
    else if (signature.startsWith("%PDF-")) mime = "application/pdf";
    if (!mime) return fail("Choose JPG, PNG, GIF, WebP, MP4, WebM or PDF");

    const id = crypto.randomUUID();
    const name = decodeURIComponent(req.headers.get("x-file-name") || "Upload").slice(0, 200);
    await uploadImageKitFile(id, name, data, mime);

    return Response.json({
      id,
      url: "/api/media/" + id,
      type: mime.startsWith("video") ? "video" : mime.startsWith("image") ? "image" : "document",
      name,
      caption: name,
      size: data.byteLength,
    });
  } catch {
    return fail("Upload failed. Please check ImageKit configuration and try again.", 503);
  }
}
