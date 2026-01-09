using Microsoft.AspNetCore.Http;
using Rujta.Infrastructure.Identity.Services.Auth;

namespace Rujta.Infrastructure.Identity.Helpers
{
    public class AuthInfrastructureContext
    {
        public ILogger<AuthInfrastructureContext> Logger { get; }
        public IHttpContextAccessor HttpContextAccessor { get; }
        public IConfiguration Configuration { get; }
        public IEmailService EmailService { get; }

        public AuthInfrastructureContext(
            ILogger<AuthInfrastructureContext> logger,
            IHttpContextAccessor httpContextAccessor,
            IConfiguration configuration,
            IEmailService emailService)
        {
            Logger = logger;
            HttpContextAccessor = httpContextAccessor;
            Configuration = configuration;
            EmailService = emailService;
        }
    }

}
