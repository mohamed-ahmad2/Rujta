import DOMPurify from "dompurify";

/**
 * Global HTML sanitizer to prevent XSS
 * Use ONLY when you need to render HTML
 */
export const sanitizeHTML = (dirty) => {
  if (!dirty) return "";
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
  });
};
