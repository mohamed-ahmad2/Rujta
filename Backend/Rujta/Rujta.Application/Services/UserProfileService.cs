using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Rujta.Application.DTOs.UserProfile;
using Rujta.Application.Interfaces;
using Rujta.Domain.Entities;
using System;
using System.Threading.Tasks;

namespace Rujta.Application.Services
{
    public class UserProfileService : IUserProfileService
    {
        private readonly UserManager<User> _userManager;

        public UserProfileService(UserManager<User> userManager)
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
                Name = user.Name,
                Address = user.Address,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                ProfileImageUrl = user.ProfileImageUrl
            };
        }

        // ✅ Update Profile
        public async Task<bool> UpdateProfileAsync(Guid userId, UpdateUserProfileDto dto)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return false;

            user.Name = dto.Name ?? user.Name;
            user.Address = dto.Address ?? user.Address;
            user.PhoneNumber = dto.PhoneNumber ?? user.PhoneNumber;
            user.ProfileImageUrl = dto.ProfileImageUrl ?? user.ProfileImageUrl;

            var result = await _userManager.UpdateAsync(user);
            return result.Succeeded;
        }
    }
}
