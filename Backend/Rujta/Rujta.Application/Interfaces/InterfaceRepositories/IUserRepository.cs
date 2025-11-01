using Rujta.Domain.Entities;
using System.Threading.Tasks;

namespace Rujta.Application.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(string userId);
    }
}
