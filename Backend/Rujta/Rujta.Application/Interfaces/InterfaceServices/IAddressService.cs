using Rujta.Application.DTOs;

namespace Rujta.Application.Interfaces.InterfaceServices
{
    public interface IAddressService : IGenericService<AddressDto>
    {
        Task<List<AddressDto>> GetUserAddressesAsync(Guid userId, CancellationToken cancellationToken = default);
        Task AddByUserAsync(Guid userId, AddressDto dto, CancellationToken cancellationToken = default);
    }
}
