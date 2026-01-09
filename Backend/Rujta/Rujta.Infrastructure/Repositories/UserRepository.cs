// UserRepository.cs (corrected version - removed unused constant)
using Rujta.Infrastructure.Identity;

namespace Rujta.Infrastructure.Repositories
{
    public class UserRepository : GenericRepository<User>, IUserRepository
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IMapper _mapper;
        private readonly IOfflineGeocodingService _offlineGeocodingService;

        public UserRepository(
            AppDbContext context,
            UserManager<ApplicationUser> userManager,
            IMapper mapper,
            IOfflineGeocodingService offlineGeocodingService)
            : base(context)
        {
            _userManager = userManager;
            _mapper = mapper;
            _offlineGeocodingService = offlineGeocodingService;
        }

        // =======================
        // ====== GetProfile =====
        // =======================
        public async Task<UserProfileDto?> GetProfileAsync(
            Guid userId,
            CancellationToken cancellationToken = default)
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
                Addresses = addresses.Select(a => new AddressDto
                {
                    Street = a.Street,
                    BuildingNo = a.BuildingNo,
                    City = a.City,
                    Governorate = a.Governorate,
                    Latitude = a.Latitude,
                    Longitude = a.Longitude
                }).ToList()
            };
        }

        public async Task<bool> UpdateProfileAsync(
            Guid userId,
            UpdateUserProfileDto dto,
            CancellationToken cancellationToken = default)
        {
            var appUser = await _userManager.Users
                .Include(u => u.DomainPerson)
                    .ThenInclude(p => (p as User)!.Addresses)
                .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

            if (appUser?.DomainPerson is not User user)
                return false;

            UpdateBasicInfo(appUser, user, dto);

            if (dto.Addresses is not null)
            {
                RemoveDeletedAddresses(user, dto);

                foreach (var addressDto in dto.Addresses)
                {
                    var (latitude, longitude) = await ResolveCoordinatesAsync(addressDto);
                    UpsertAddress(user, addressDto, latitude, longitude);
                }
            }

            var result = await _userManager.UpdateAsync(appUser);
            await _context.SaveChangesAsync(cancellationToken);

            return result.Succeeded;
        }

        // =======================
        // ==== GetByEmail =======
        // =======================
        public async Task<ApplicationUserDto?> GetByEmailAsync(string email)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email);

            if (user is null)
                return null;

            var userDto = _mapper.Map<ApplicationUserDto>(user);

            var roles = await _userManager.GetRolesAsync(user);
            userDto.Role = roles.FirstOrDefault() ?? "User";

            return userDto;
        }

        // =======================
        // ===== Helpers =========
        // =======================
        private static void UpdateBasicInfo(
            ApplicationUser appUser,
            User user,
            UpdateUserProfileDto dto)
        {
            user.Name = dto.Name ?? user.Name;
            appUser.FullName = dto.Name ?? appUser.FullName;
            appUser.PhoneNumber = dto.PhoneNumber ?? appUser.PhoneNumber;
            user.ProfileImageUrl = dto.ProfileImageUrl ?? user.ProfileImageUrl;
        }

        private void RemoveDeletedAddresses(User user, UpdateUserProfileDto dto)
        {
            var toRemove = user.Addresses
                .Where(a => !dto.Addresses!.Any(d => d.Id.HasValue && d.Id == a.Id))
                .ToList();

            foreach (var address in toRemove)
                _context.Addresses.Remove(address);
        }

        private async Task<(double Latitude, double Longitude)> ResolveCoordinatesAsync(AddressDto addressDto)
        {
            return await _offlineGeocodingService
                .GetCoordinatesAsync(addressDto.Street ?? "",
                                     addressDto.BuildingNo,
                                     addressDto.City ?? "",
                                     addressDto.Governorate ?? "");
        }

        private static void UpsertAddress(
            User user,
            AddressDto addressDto,
            double latitude,
            double longitude)
        {
            if (addressDto.Id.HasValue)
            {
                var existing = user.Addresses
                    .FirstOrDefault(a => a.Id == addressDto.Id);

                if (existing is null)
                    return;

                existing.Street = addressDto.Street ?? existing.Street;
                existing.BuildingNo = addressDto.BuildingNo ?? existing.BuildingNo;
                existing.City = addressDto.City ?? existing.City;
                existing.Governorate = addressDto.Governorate ?? existing.Governorate;
                existing.Latitude = latitude;
                existing.Longitude = longitude;
            }
            else
            {
                user.Addresses.Add(new Address
                {
                    PersonId = user.Id,
                    Street = addressDto.Street ?? string.Empty,
                    BuildingNo = addressDto.BuildingNo ?? string.Empty,
                    City = addressDto.City ?? string.Empty,
                    Governorate = addressDto.Governorate ?? string.Empty,
                    Latitude = latitude,
                    Longitude = longitude
                });
            }
        }
    }
}