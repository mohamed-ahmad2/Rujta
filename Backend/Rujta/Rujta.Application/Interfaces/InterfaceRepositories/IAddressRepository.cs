using Rujta.Application.DTOs;
using Rujta.Domain.Entities;

namespace Rujta.Application.Interfaces.InterfaceRepositories
{
    public interface IAddressRepository : IGenericRepository<Address>
    {
        Task<List<AddressDto>> GetUserAddressesAsync(Guid userId, CancellationToken cancellationToken = default);
    }
}
