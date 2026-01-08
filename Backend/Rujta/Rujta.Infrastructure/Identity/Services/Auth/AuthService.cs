namespace Rujta.Infrastructure.Identity.Services.Auth
{
    public partial class AuthService : IAuthService
    {
        private readonly AuthIdentityContext _identity;
        private readonly AuthInfrastructureContext _infra;
        private readonly TokenHelper _tokenHelper;

        public AuthService(
            AuthIdentityContext identity,
            AuthInfrastructureContext infra,
            TokenHelper tokenHelper)
        {
            _identity = identity;
            _infra = infra;
            _tokenHelper = tokenHelper;
        }
    }
}
