import type { BusinessMedia } from "@prisma/client";

export type ListingMedia = {
  kind: "video" | "image" | "logo" | "placeholder";
  url: string;
  thumbnailUrl?: string | null;
  isVideo: boolean;
};

const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
      <rect fill="#1B3A4B" width="1200" height="800"/>
      <rect fill="#C45C26" x="0" y="740" width="1200" height="60"/>
      <text x="80" y="400" fill="#F4EFE6" font-family="Georgia, serif" font-size="42">Directory</text>
    </svg>`,
  );

function youtubeId(url: string) {
  const match = url.match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{6,})/);
  return match?.[1] ?? null;
}

export function youtubeEmbed(url: string) {
  const id = youtubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : url;
}

export function youtubeThumb(url: string) {
  const id = youtubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

export function pickListingMedia(
  media: BusinessMedia[],
  priority: string[] = ["video", "hero", "google", "logo", "placeholder"],
): ListingMedia {
  const videos = media.filter((m) => m.type === "VIDEO" && m.url);
  const images = media.filter((m) => m.type === "IMAGE" && m.url);
  const logos = media.filter((m) => m.type === "LOGO" && m.url);
  const featuredVideo = videos.find((m) => m.featured) ?? videos[0];
  const hero = images.find((m) => m.featured) ?? images[0];
  const google = images.find((m) => m.source === "GOOGLE_PLACES");
  const logo = logos[0];

  for (const key of priority) {
    if (key === "video" && featuredVideo?.url) {
      return {
        kind: "video",
        url: featuredVideo.url,
        thumbnailUrl: featuredVideo.thumbnailUrl || youtubeThumb(featuredVideo.url) || hero?.url,
        isVideo: true,
      };
    }
    if (key === "hero" && hero?.url) {
      return { kind: "image", url: hero.url, thumbnailUrl: hero.thumbnailUrl, isVideo: false };
    }
    if (key === "google" && google?.url) {
      return { kind: "image", url: google.url, isVideo: false };
    }
    if (key === "logo" && logo?.url) {
      return { kind: "logo", url: logo.url, isVideo: false };
    }
  }

  return { kind: "placeholder", url: PLACEHOLDER, isVideo: false };
}

export function galleryItems(media: BusinessMedia[]) {
  return [...media].sort((a, b) => a.sortOrder - b.sortOrder);
}
