export type VideoType = "youtube" | "direct" | "iframe";

const YOUTUBE_REGEX =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

// Direct video file extensions (including before query params)
const DIRECT_VIDEO_REGEX = /\.(mp4|m3u8|webm|mov|avi|mkv|ogg|3gp|ts|flv)(\?.*)?$/i;

export const isYouTubeUrl = (url: string): boolean => {
  return YOUTUBE_REGEX.test(url);
};

export const extractYouTubeId = (url: string): string | null => {
  const match = url.match(YOUTUBE_REGEX);
  return match ? match[1] : null;
};

export const isDirectVideoUrl = (url: string): boolean => {
  try {
    const { pathname } = new URL(url);
    return DIRECT_VIDEO_REGEX.test(pathname);
  } catch {
    return DIRECT_VIDEO_REGEX.test(url);
  }
};

export const getVideoType = (url: string): VideoType => {
  if (isYouTubeUrl(url)) return "youtube";
  if (isDirectVideoUrl(url)) return "direct";
  return "iframe";
};

/**
 * Convert regular video page URLs to their embed equivalents.
 * Embed URLs show only the video player, not the full website.
 */
export const toEmbedUrl = (url: string): string => {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }

  const host = parsed.hostname.replace("www.", "");

  // Vimeo: vimeo.com/123456 → player.vimeo.com/video/123456
  if (host === "player.vimeo.com") return url;
  if (host === "vimeo.com") {
    const match = parsed.pathname.match(/^\/(\d+)/);
    if (match) return `https://player.vimeo.com/video/${match[1]}?autoplay=0`;
  }

  // Dailymotion: dailymotion.com/video/x8abc → dailymotion.com/embed/video/x8abc
  if (host === "dailymotion.com") {
    const match = parsed.pathname.match(/\/video\/([a-zA-Z0-9]+)/);
    if (match) return `https://www.dailymotion.com/embed/video/${match[1]}`;
  }

  // Twitch clips: clips.twitch.tv/ClipName → clips.twitch.tv/embed?clip=ClipName
  if (host === "clips.twitch.tv") {
    const clip = parsed.pathname.slice(1);
    if (clip) return `https://clips.twitch.tv/embed?clip=${clip}&parent=localhost`;
  }

  // Twitch channels/videos: twitch.tv/channel → player.twitch.tv/?channel=xxx
  if (host === "twitch.tv") {
    const match = parsed.pathname.match(/^\/videos\/(\d+)/);
    if (match) return `https://player.twitch.tv/?video=v${match[1]}&parent=localhost`;
    const channel = parsed.pathname.slice(1).split("/")[0];
    if (channel) return `https://player.twitch.tv/?channel=${channel}&parent=localhost`;
  }
  if (host === "player.twitch.tv") return url;

  // Facebook video: facebook.com/watch?v=123 or facebook.com/xxx/videos/123
  if (host === "facebook.com" || host === "fb.watch") {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`;
  }

  // Instagram Reels/TV: instagram.com/reel/xxx → instagram.com/reel/xxx/embed
  if (host === "instagram.com") {
    const match = parsed.pathname.match(/\/(reel|tv|p)\/([^/]+)/);
    if (match && !parsed.pathname.endsWith("/embed")) {
      return `https://www.instagram.com/${match[1]}/${match[2]}/embed`;
    }
  }

  // Streamable: streamable.com/xxx → streamable.com/e/xxx
  if (host === "streamable.com") {
    const id = parsed.pathname.slice(1);
    if (id && !id.startsWith("e/")) return `https://streamable.com/e/${id}`;
  }

  // Kick: kick.com/channel → player.kick.com/channel
  if (host === "kick.com") {
    const channel = parsed.pathname.slice(1).split("/")[0];
    if (channel) return `https://player.kick.com/${channel}`;
  }

  // Rumble: rumble.com/xxx.html → rumble.com/embed/xxx
  if (host === "rumble.com") {
    const match = parsed.pathname.match(/\/([a-zA-Z0-9]+)\.html/);
    if (match) return `https://rumble.com/embed/${match[1]}/`;
  }

  // Loom: loom.com/share/xxx → loom.com/embed/xxx
  if (host === "loom.com") {
    const match = parsed.pathname.match(/\/share\/([a-zA-Z0-9]+)/);
    if (match) return `https://www.loom.com/embed/${match[1]}`;
  }

  // If URL already looks like an embed (contains /embed), return as-is
  if (parsed.pathname.includes("/embed")) return url;

  // Unknown site — return as-is, WebView will load full page
  return url;
};
