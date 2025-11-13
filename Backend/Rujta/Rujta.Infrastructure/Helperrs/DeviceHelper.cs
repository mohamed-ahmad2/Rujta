using Microsoft.AspNetCore.Http;


namespace Rujta.Infrastructure.Helperrs
{
    public static class DeviceHelper
    {
        public static string GetDeviceInfo(HttpContext? httpContext)
        {
            if (httpContext == null)
                return "Unknown device";

            var userAgent = httpContext.Request.Headers["User-Agent"].ToString() ?? "Unknown";

            string browser = "Unknown Browser";
            string os = "Unknown OS";

            
            if (userAgent.Contains("Brave", StringComparison.OrdinalIgnoreCase))
                browser = "Brave";
            else if (userAgent.Contains("Chrome", StringComparison.OrdinalIgnoreCase))
                browser = "Chrome";
            else if (userAgent.Contains("Edg", StringComparison.OrdinalIgnoreCase))
                browser = "Edge";
            else if (userAgent.Contains("Firefox", StringComparison.OrdinalIgnoreCase))
                browser = "Firefox";
            else if (userAgent.Contains("Safari", StringComparison.OrdinalIgnoreCase) && !userAgent.Contains("Chrome"))
                browser = "Safari";

            
            if (userAgent.Contains("Windows NT 10.0")) os = "Windows 10";
            else if (userAgent.Contains("Windows NT 11.0")) os = "Windows 11";
            else if (userAgent.Contains("Macintosh")) os = "MacOS";
            else if (userAgent.Contains("Linux")) os = "Linux";

            return $"{browser} on {os}";
        }
    }
}
