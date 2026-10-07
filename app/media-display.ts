import previews from './media-previews.json';
export function mediaDisplayUrl(url:string){const id=url.match(/^\/api\/media\/([0-9a-f-]{36})$/)?.[1];return id?(previews as Record<string,string>)[id]||url:url}
