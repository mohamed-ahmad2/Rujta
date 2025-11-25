using Rujta.Application.DTOs;
using Rujta.Application.DTOs.UserProfile;
using Rujta.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Rujta.Application.Interfaces.InterfaceRepositories
{
    public interface IUserRepository : IGenericRepository<User>
    {
        Task<UserProfileDto?> GetProfileAsync(Guid userId, CancellationToken cancellationToken = default);

        Task<bool> UpdateProfileAsync(Guid userId, UpdateUserProfileDto dto, CancellationToken cancellationToken = default);
        Task<ApplicationUserDto?> GetByEmailAsync(string email);
    }
}
