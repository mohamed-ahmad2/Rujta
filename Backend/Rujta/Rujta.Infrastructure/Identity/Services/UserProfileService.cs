using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Rujta.Application.DTOs.UserProfile;
using Rujta.Application.Interfaces;
using Rujta.Domain.Common;

namespace Rujta.Infrastructure.Identity.Services
{
    public class UserProfileService : IUserProfileService
    {
        private readonly UserManager<Person> _userManager;

        public UserProfileService(UserManager<Person> userManager)
        {
            _userManager = userManager;
        }

        public async Task<UserProfileDto?> GetProfileAsync(Guid userId)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return null;

            return new UserProfileDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                ProfileImageUrl = user.ProfileImageUrl
            };
        }

        public async Task<bool> UpdateProfileAsync(Guid userId, UpdateUserProfileDto dto)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return false;

            user.FullName = dto.FullName ?? user.FullName;
            user.PhoneNumber = dto.PhoneNumber ?? user.PhoneNumber;
            user.ProfileImageUrl = dto.ProfileImageUrl ?? user.ProfileImageUrl;

            var result = await _userManager.UpdateAsync(user);
            return result.Succeeded;
        }
    }
}
