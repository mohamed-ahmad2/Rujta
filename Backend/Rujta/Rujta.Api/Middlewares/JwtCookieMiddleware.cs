namespace Rujta.API.Middlewares
{
    public class JwtCookieMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<JwtCookieMiddleware> _logger;

        public JwtCookieMiddleware(RequestDelegate next, ILogger<JwtCookieMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                if (context.Items.TryGetValue("JwtToken", out var tokenObj))
                {
                    var token = tokenObj as string;

                    if (!string.IsNullOrEmpty(token))
                    {
                        var cookieOptions = new CookieOptions
                        {
                            HttpOnly = true,                  
                            Secure = true,                    
                            SameSite = SameSiteMode.Strict,
                            Expires = DateTime.UtcNow.AddMinutes(30)
                        };

                        context.Response.Cookies.Append("jwt", token, cookieOptions);
                        _logger.LogInformation("JWT cookie added successfully.");
                    }
                    else
                    {
                        _logger.LogWarning("JWT token is null or empty, cookie not set.");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while adding JWT cookie");
            }

            await _next(context);
        }
    }
}
