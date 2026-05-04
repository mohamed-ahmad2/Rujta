using Rujta.Application.DTOs.CustomerDtos;


namespace Rujta.Application.Interfaces
{
    public interface IAddressResolver
    {
        Task<AddressDto> ResolveAsync(AddressDto dto);
    }
}
