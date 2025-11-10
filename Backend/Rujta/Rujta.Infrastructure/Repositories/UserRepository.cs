using Rujta.Application.Interfaces;
using Rujta.Domain.Entities;
using Rujta.Infrastructure.Data;
using System;
using System.Threading.Tasks;

namespace Rujta.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByIdAsync(string userId)
        {
            var appUser = await _context.Users.FindAsync(Guid.Parse(userId)); // ApplicationUser
            if (appUser == null) return null;

            // Map ApplicationUser -> domain User
            return new User
            {
                Id = appUser.Id,
                Name = appUser.UserName,
                Email = appUser.Email
            };
        }
    }
}
