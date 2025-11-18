using Rujta.Infrastructure.Identity;

namespace Rujta.Infrastructure.Repositories
{
    public class UserRepository : GenericRepository<User>, IUserRepository
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public UserRepository(AppDbContext context, UserManager<ApplicationUser> userManager)
            : base(context) => _userManager = userManager;

        public async Task<UserProfileDto?> GetProfileAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            var appUser = await _userManager.Users
                .Include(u => u.DomainPerson)
                .FirstOrDefaultAsync(u => u.DomainPersonId == userId, cancellationToken);

            if (appUser?.DomainPerson is not User user)
                return null;

            var address = user.Address;

            return new UserProfileDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = appUser.Email,
                PhoneNumber = appUser.PhoneNumber,
                ProfileImageUrl = user.ProfileImageUrl,
                Address = address is null ? null : new AddressDto
                {
                    FullName = address.FullName,
                    MobileNumber = address.MobileNumber,
                    Street = address.Street,
                    BuildingNo = address.BuildingNo,
                    City = address.City,
                    Governorate = address.Governorate,
                    Instructions = address.Instructions
                }
            };
        }

        public async Task<bool> UpdateProfileAsync(Guid userId, UpdateUserProfileDto dto, CancellationToken cancellationToken = default)
        {
            var appUser = await _userManager.Users
                .Include(u => u.DomainPerson)
                .FirstOrDefaultAsync(u => u.DomainPersonId == userId, cancellationToken);

            if (appUser?.DomainPerson is not User user)
                return false;

            user.Name = dto.Name ?? user.Name;

            if (dto.Address != null)
            {
                if (user.Address == null)
                    user.Address = new Address { UserId = user.Id };

                var address = user.Address;
                address.FullName = dto.Address.FullName ?? address.FullName;
                address.MobileNumber = dto.Address.MobileNumber ?? address.MobileNumber;
                address.Street = dto.Address.Street ?? address.Street;
                address.BuildingNo = dto.Address.BuildingNo ?? address.BuildingNo;
                address.City = dto.Address.City ?? address.City;
                address.Governorate = dto.Address.Governorate ?? address.Governorate;
                address.Instructions = dto.Address.Instructions ?? address.Instructions;
            }

            user.ProfileImageUrl = dto.ProfileImageUrl ?? user.ProfileImageUrl;
            appUser.PhoneNumber = dto.PhoneNumber ?? appUser.PhoneNumber;

            var result = await _userManager.UpdateAsync(appUser);
            return result.Succeeded;
        }
    }
}