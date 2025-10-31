using Rujta.Application.DTOs.UserProfile;
using System.Threading.Tasks;

namespace Rujta.Application.Interfaces.InterfaceRepositories
{
    public interface IUserProfileService
    {
        Task<UserProfileDto?> GetProfileAsync(Guid userId);
        Task<bool> UpdateProfileAsync(Guid userId, UpdateUserProfileDto dto);
    }
}
