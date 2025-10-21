using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Rujta.Application.DTOs.UserProfile;
using Rujta.Application.Interfaces;
using Rujta.Domain.Common;
using Rujta.Infrastructure.Identity;


namespace Rujta.Application.Services
{
    public class UserProfileService : IUserProfileService
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public UserProfileService(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<UserProfileDto?> GetProfileAsync(Guid userId)
        {
            var appUser = await _userManager.Users
                .Include(u => u.DomainPerson)
                .FirstOrDefaultAsync(u => u.DomainPerson.Id == userId);

            if (appUser == null || appUser.DomainPerson == null)
                return null;

            var person = appUser.DomainPerson;

            return new UserProfileDto
            {
                Id = person.Id,
                Name = person.Name,
                Email = appUser.Email, 
                PhoneNumber = appUser.PhoneNumber,
                Address = person.Address,
                ProfileImageUrl = person.ProfileImageUrl
            };
        }

        public async Task<bool> UpdateProfileAsync(Guid userId, UpdateUserProfileDto dto)
        {
            var appUser = await _userManager.Users
                .Include(u => u.DomainPerson)
                .FirstOrDefaultAsync(u => u.DomainPerson.Id == userId);

            if (appUser == null || appUser.DomainPerson == null)
                return false;

            var person = appUser.DomainPerson;

            person.Name = dto.Name ?? person.Name;
            person.Address = dto.Address ?? person.Address;
            person.ProfileImageUrl = dto.ProfileImageUrl ?? person.ProfileImageUrl;

            appUser.PhoneNumber = dto.PhoneNumber ?? appUser.PhoneNumber;

            var result = await _userManager.UpdateAsync(appUser);
            return result.Succeeded;
        }
    }
}
