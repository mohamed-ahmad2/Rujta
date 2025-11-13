using Microsoft.Extensions.Options;

namespace Rujta.API.Middlewares
{
    public class JwtCookieMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<JwtCookieMiddleware> _logger;
        private readonly IConfiguration _configuration;

        public JwtCookieMiddleware(
            RequestDelegate next,
            ILogger<JwtCookieMiddleware> logger,
            IConfiguration configuration) 
        {
            _next = next;
            _logger = logger;
            _configuration = configuration; 
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
                        var accessTokenExpirationMinutes = int.TryParse(
                            _configuration["JWT:AccessTokenExpirationMinutes"],
                            out var minutes) ? minutes : 10;

                        var cookieOptions = new CookieOptions
                        {
                            HttpOnly = true,
                            Secure = context.Request.IsHttps,
                            SameSite = SameSiteMode.None,
                            Expires = DateTime.UtcNow.AddMinutes(accessTokenExpirationMinutes)
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
