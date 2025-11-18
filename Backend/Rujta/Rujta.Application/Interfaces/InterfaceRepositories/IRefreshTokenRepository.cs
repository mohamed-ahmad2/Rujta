using Rujta.Domain.Entities;


namespace Rujta.Application.Interfaces.InterfaceRepositories
{
    public interface IRefreshTokenRepository : IGenericRepository<RefreshToken>
    {
        Task<RefreshToken?> GetByTokenAsync(string token);
        Task<RefreshToken?> GetValidTokenAsync(Guid userId, string tokenHash);
        void RemoveRange(IEnumerable<RefreshToken> tokens);
        Task<List<RefreshToken>> GetExpiredOrRevokedAsync(DateTime now);
        Task<List<RefreshToken>> GetAllValidTokensByUserIdAsync(Guid userId);
        Task ExecuteWithSerializableTransactionAsync(Func<Task> action);
        Task<IEnumerable<RefreshToken>> GetAllByDeviceIdAsync(Guid userId, string deviceId);
    }
}
