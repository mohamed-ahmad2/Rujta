using AutoMapper;
using Rujta.Application.DTOs;
using Rujta.Domain.Entities;

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
