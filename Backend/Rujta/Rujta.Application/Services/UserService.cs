using Microsoft.Extensions.Caching.Memory;

namespace Rujta.Application.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IMemoryCache _cache;

        public UserService(IUserRepository userRepository, IMemoryCache cache)
        {
            _userRepository = userRepository;
            _cache = cache;
        }

        public async Task<UserProfileDto?> GetProfileAsync(Guid userId, Guid personId, CancellationToken cancellationToken = default)
        {

            string cacheKey = $"UserProfile_{personId}";
            if (_cache.TryGetValue<UserProfileDto>(cacheKey, out var cached) && cached != null)
                return cached;

            var profile = await _userRepository.GetProfileAsync(userId, cancellationToken);
            if (profile != null)
                _cache.Set(cacheKey, profile, TimeSpan.FromMinutes(5));

            return profile;
        }

        public async Task<bool> UpdateProfileAsync(Guid userId, Guid personId, UpdateUserProfileDto dto, CancellationToken cancellationToken = default)
        {
            var result = await _userRepository.UpdateProfileAsync(userId, dto, cancellationToken);

            if (result)
            {
                _cache.Remove($"UserProfile_{personId}");
                _cache.Remove($"UserAddresses_{personId}");
                _cache.Remove("AllAddresses");
            }

            return result;
        }

        public async Task<ApplicationUserDto?> GetByEmailAsync(string email) =>
            await _userRepository.GetByEmailAsync(email);
    }

}
