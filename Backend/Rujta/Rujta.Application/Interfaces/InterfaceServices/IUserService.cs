using Rujta.Application.DTOs;
using Rujta.Infrastructure.Identity;


namespace Rujta.Application.Interfaces.InterfaceServices
{
    public interface IUserService
    {
        Task<bool> IsEmailExistsAsync(string email, CancellationToken cancellationToken = default);
        Task<bool> CheckPasswordAsync(string email, string password, CancellationToken cancellationToken = default);
        Task<Guid> CreateUserAsync(RegisterDto dto, Guid domainPersonId, UserRole role, CancellationToken cancellationToken = default);
        Task<TokenDto> GenerateTokensAsync(string email, CancellationToken cancellationToken = default);
        Task<TokenDto> RefreshTokensAsync(string refreshToken, CancellationToken cancellationToken = default);
    }
}
