import { fail } from "../../../../lib/studio";
import { imageKitMediaUrl } from "../../../../lib/imagekit";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!/^[0-9a-f-]{36}$/.test(id)) return fail("Not found", 404);

    return Response.redirect(imageKitMediaUrl(id), 302);
  } catch {
    return fail("Media unavailable", 503);
  }
}
