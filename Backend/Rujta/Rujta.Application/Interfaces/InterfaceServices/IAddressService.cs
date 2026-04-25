using Rujta.Application.DTOs.CustomerDtos;
using Rujta.Application.Interfaces.InterfaceServices.IGenericS;

namespace Rujta.Application.Interfaces.InterfaceServices
{
    public interface IAddressService : IGenericService<AddressDto,int>
    {
        Task<List<AddressDto>> GetUserAddressesAsync(Guid userId, Guid personId, CancellationToken cancellationToken = default);
        Task AddByUserAsync(Guid userId, AddressDto dto, CancellationToken cancellationToken = default);
    }
}
