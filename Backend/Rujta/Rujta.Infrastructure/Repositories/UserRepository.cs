using Rujta.Infrastructure.Identity;

namespace Rujta.Infrastructure.Repositories
{
    public class UserRepository : GenericRepository<User>, IUserRepository
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IMapper _mapper;

        public UserRepository(AppDbContext context, UserManager<ApplicationUser> userManager, IMapper mapper) : base(context)
        {
            _userManager = userManager;
            _mapper = mapper;
        }

        public async Task<UserProfileDto?> GetProfileAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            var appUser = await _userManager.Users
                .Include(u => u.DomainPerson)
                .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

            if (appUser?.DomainPerson is not User user)
                return null;

            var userAddress = await _context.Addresses
                    .FirstOrDefaultAsync(a => a.UserId == user.Id, cancellationToken);

            return new UserProfileDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = appUser.Email,
                PhoneNumber = appUser.PhoneNumber,
                ProfileImageUrl = user.ProfileImageUrl,
                Latitude = user.Latitude,
                Longitude = user.Longitude,
                Address = userAddress is null ? null : new AddressDto
                {
                    Street = userAddress.Street,
                    BuildingNo = userAddress.BuildingNo,
                    City = userAddress.City,
                    Governorate = userAddress.Governorate,
                }
            };
        }

        public async Task<bool> UpdateProfileAsync(Guid userId, UpdateUserProfileDto dto, CancellationToken cancellationToken = default)
        {
            var appUser = await _userManager.Users
    .Include(u => (u.DomainPerson as User)!.Address)
    .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);


            if (appUser?.DomainPerson is not User user)
                return false;

            user.Name = dto.Name ?? user.Name;
            appUser.FullName = dto.Name ?? appUser.FullName;

            if (dto.Address != null)
            {
                if (user.Address == null)
                    user.Address = new Address { UserId = user.Id };

                var address = user.Address;
                address.Street = dto.Address.Street ?? address.Street;
                address.BuildingNo = dto.Address.BuildingNo ?? address.BuildingNo;
                address.City = dto.Address.City ?? address.City;
                address.Governorate = dto.Address.Governorate ?? address.Governorate;
            }

            user.ProfileImageUrl = dto.ProfileImageUrl ?? user.ProfileImageUrl;
            appUser.PhoneNumber = dto.PhoneNumber ?? appUser.PhoneNumber;

            var result = await _userManager.UpdateAsync(appUser);
            return result.Succeeded;
        }

        public async Task<ApplicationUserDto?> GetByEmailAsync(string email)
        {
            var user =  await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
                return null;

            var userDto = _mapper.Map<ApplicationUserDto>(user);

            var roles = await _userManager.GetRolesAsync(user);
            userDto.Role = roles.FirstOrDefault() ?? "User";

            return userDto;
        }
    }
}