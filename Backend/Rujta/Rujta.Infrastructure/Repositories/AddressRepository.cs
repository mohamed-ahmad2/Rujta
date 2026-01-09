using Microsoft.AspNetCore.Identity;
using Rujta.Infrastructure.Identity;

namespace Rujta.Infrastructure.Repositories
{
    public class AddressRepository : GenericRepository<Address>, IAddressRepository
    {
        private readonly UserManager<ApplicationUser> _userManager;
        public AddressRepository(AppDbContext context, UserManager<ApplicationUser> userManager) : base(context)
        {
            _userManager = userManager;
        }

        public async Task<List<AddressDto>> GetUserAddressesAsync(Guid userId,CancellationToken cancellationToken = default)
        {
            var appUser = await _userManager.Users
                .Include(u => u.DomainPerson)
                    .ThenInclude(p => (p as User)!.Addresses)
                .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

            if (appUser?.DomainPerson is not User user)
                return new List<AddressDto>();

            var addresses = user.Addresses ?? new List<Address>();

            return addresses.Select(a => new AddressDto
            {
                Id = a.Id,
                Street = a.Street,
                BuildingNo = a.BuildingNo,
                City = a.City,
                Governorate = a.Governorate,
                Latitude = a.Latitude,
                Longitude= a.Longitude,
            }).ToList();
        }

    }
}
