namespace Rujta.Application.Interfaces.InterfaceServices
{
    public interface IUserService
    {
        Task<UserProfileDto?> GetProfileAsync(Guid userId, Guid personId, CancellationToken cancellationToken = default);
        Task<bool> UpdateProfileAsync(Guid userId, Guid personId, UpdateUserProfileDto dto, CancellationToken cancellationToken = default);
        Task<ApplicationUserDto?> GetByEmailAsync(string email);
    }
}
