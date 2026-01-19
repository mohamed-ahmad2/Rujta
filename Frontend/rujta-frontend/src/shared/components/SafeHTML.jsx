import { sanitizeHTML } from "@/utils/sanitize";

/**
 * Safe HTML renderer (XSS protected)
 */
const SafeHTML = ({ html, className = "" }) => {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{
        __html: sanitizeHTML(html),
      }}
    />
  );
};

export default SafeHTML;
