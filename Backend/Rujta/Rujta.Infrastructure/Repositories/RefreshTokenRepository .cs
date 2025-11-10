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
        


    }
}
