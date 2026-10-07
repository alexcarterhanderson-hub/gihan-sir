import { env } from "cloudflare:workers";

const IMAGEKIT_FOLDER = "/science-with-gihan";

function privateKey() {
  const key = (env as Cloudflare.Env & { SCIENCE_MEDIA?: string }).SCIENCE_MEDIA;
  if (!key) throw new Error("ImageKit secret SCIENCE_MEDIA is not configured.");
  return key;
}

export function imageKitMediaUrl(id: string) {
  const endpoint = (env as Cloudflare.Env & { IMAGEKIT_URL_ENDPOINT?: string })
    .IMAGEKIT_URL_ENDPOINT;
  if (!endpoint) throw new Error("ImageKit URL endpoint is not configured.");
  return `${endpoint.replace(/\/+$/, "")}${IMAGEKIT_FOLDER}/${id}`;
}

export async function uploadImageKitFile(
  id: string,
  fileName: string,
  data: ArrayBuffer,
  mime: string,
) {
  const form = new FormData();
  form.append("file", new Blob([data], { type: mime }), fileName);
  form.append("fileName", id);
  form.append("folder", IMAGEKIT_FOLDER);
  form.append("useUniqueFileName", "false");

  const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${privateKey()}:`)}`,
    },
    body: form,
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`ImageKit upload failed (${response.status}): ${details}`);
  }
}
