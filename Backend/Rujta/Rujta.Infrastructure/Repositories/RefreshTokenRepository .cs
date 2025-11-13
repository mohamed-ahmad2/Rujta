

namespace Rujta.Infrastructure.Repositories
{
    public class RefreshTokenRepository :GenericRepository<RefreshToken>, IRefreshTokenRepository
    {
        public RefreshTokenRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<RefreshToken?> GetByTokenAsync(string token) =>
             await _context.Set<RefreshToken>()
                                 .FirstOrDefaultAsync(rt => rt.Token == token);

        
        public async Task<RefreshToken?> GetValidTokenAsync(Guid userId, string tokenHash)
        {
            return await _context.RefreshTokens
                .Where(t => t.UserId == userId && !t.Revoked && t.Expiration > DateTime.UtcNow && t.Token == tokenHash)
                .FirstOrDefaultAsync();
        }

        public void RemoveRange(IEnumerable<RefreshToken> tokens) => 
            _context.RefreshTokens.RemoveRange(tokens);

        public async Task<List<RefreshToken>> GetExpiredOrRevokedAsync(DateTime now) =>
            await _context.RefreshTokens
                .Where(t => t.Revoked || t.Expiration < now)
                .ToListAsync();


        public async Task<List<RefreshToken>> GetAllValidTokensByUserIdAsync(Guid userId) =>
                await _context.RefreshTokens
                    .Where(rt => rt.UserId == userId && !rt.Revoked && rt.Expiration > DateTime.UtcNow)
                    .ToListAsync();

        public async Task ExecuteWithSerializableTransactionAsync(Func<Task> action)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);
            await action();
            await transaction.CommitAsync();
        }

        public async Task<IEnumerable<RefreshToken>> GetAllByDeviceIdAsync(Guid userId, string deviceId) =>
   
            await _context.RefreshTokens
                .Where(t => t.UserId == userId && t.DeviceInfo == deviceId && !t.Revoked && t.Expiration > DateTime.UtcNow)
                .ToListAsync();
        
    }
}
