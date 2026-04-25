using Rujta.Application.DTOs.CustomerDtos;

namespace Rujta.Application.Interfaces.InterfaceRepositories
{
    public interface IAddressRepository : IGenericRepository<Address , int>
    {
        Task<List<AddressDto>> GetUserAddressesAsync(Guid userId, CancellationToken cancellationToken = default);
    }
}
