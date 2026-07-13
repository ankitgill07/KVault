const backendBaseUrl = (import.meta.env.VITE_BACKEND_BASE_URL || "").replace(/\/$/, "");

export const getMediaUrl = (url?: string): string => {
  if (!url) {
    return "";
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (url.startsWith("/") && backendBaseUrl) {
    return `${backendBaseUrl}${url}`;
  }

  return url;
};
