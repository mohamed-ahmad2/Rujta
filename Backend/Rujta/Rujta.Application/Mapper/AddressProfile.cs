using Rujta.Application.DTOs.CustomerDtos;

namespace Rujta.Application.Mapper
{
    public class AddressProfile : Profile
    {
        public AddressProfile()
        {
            CreateMap<Address, AddressDto>().ReverseMap();
        }
    }
}
