namespace Rujta.Infrastructure.Identity.Helpers
{
    public class AuthIdentityContext
    {
        public IdentityServices Identity { get; }
        public IUnitOfWork UnitOfWork { get; }
        public IMapper Mapper { get; }

        public AuthIdentityContext(
            IdentityServices identity,
            IUnitOfWork unitOfWork,
            IMapper mapper)
        {
            Identity = identity;
            UnitOfWork = unitOfWork;
            Mapper = mapper;
        }
    }

}
