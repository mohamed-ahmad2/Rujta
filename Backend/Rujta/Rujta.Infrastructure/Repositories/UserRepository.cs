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
                    .ThenInclude(p => (p as User)!.Addresses)
                .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

            if (appUser?.DomainPerson is not User user)
                return null;

            var addresses = user.Addresses ?? new List<Address>();

            return new UserProfileDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = appUser.Email,
                PhoneNumber = appUser.PhoneNumber,
                ProfileImageUrl = user.ProfileImageUrl,
                Latitude = user.Latitude,
                Longitude = user.Longitude,
                Addresses = addresses.Select(a => new AddressDto
                {
                    Street = a.Street,
                    BuildingNo = a.BuildingNo,
                    City = a.City,
                    Governorate = a.Governorate
                }).ToList()
            };
        }



        public async Task<bool> UpdateProfileAsync(Guid userId, UpdateUserProfileDto dto, CancellationToken cancellationToken = default)
        {
            var appUser = await _userManager.Users
                .Include(u => u.DomainPerson)
                    .ThenInclude(p => (p as User)!.Addresses)
                .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

            if (appUser?.DomainPerson is not User user)
                return false;

            user.Name = dto.Name ?? user.Name;
            appUser.FullName = dto.Name ?? appUser.FullName;
            appUser.PhoneNumber = dto.PhoneNumber ?? appUser.PhoneNumber;
            user.ProfileImageUrl = dto.ProfileImageUrl ?? user.ProfileImageUrl;

            if (dto.Addresses != null)
            {
                var toRemove = user.Addresses
                    .Where(a => !dto.Addresses.Any(d => d.Id.HasValue && d.Id == a.Id))
                    .ToList();

                foreach (var r in toRemove)
                    _context.Addresses.Remove(r);

                foreach (var addressDto in dto.Addresses)
                {
                    if (addressDto.Id.HasValue)
                    {
                        var existing = user.Addresses.FirstOrDefault(a => a.Id == addressDto.Id);
                        if (existing != null)
                        {
                            existing.Street = addressDto.Street ?? existing.Street;
                            existing.BuildingNo = addressDto.BuildingNo ?? existing.BuildingNo;
                            existing.City = addressDto.City ?? existing.City;
                            existing.Governorate = addressDto.Governorate ?? existing.Governorate;
                            existing.IsDefault = addressDto.IsDefault;
                        }
                    }
                    else
                    {
                        user.Addresses.Add(new Address
                        {
                            PersonId = user.Id,
                            Street = addressDto.Street ?? "",
                            BuildingNo = addressDto.BuildingNo ?? "",
                            City = addressDto.City ?? "",
                            Governorate = addressDto.Governorate ?? "",
                            IsDefault = addressDto.IsDefault
                        });
                    }
                }
            }

            var result = await _userManager.UpdateAsync(appUser);
            await _context.SaveChangesAsync(cancellationToken);

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