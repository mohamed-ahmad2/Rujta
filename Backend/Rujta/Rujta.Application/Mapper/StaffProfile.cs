using AutoMapper;
using Rujta.Application.DTOs;
using Rujta.Domain.Entities;

namespace Rujta.Application.Mapping
{
    public class StaffProfile : Profile
    {
        public StaffProfile()
        {
            CreateMap<Staff, StaffDto>()
                .ForMember(dest => dest.ManagerName, opt => opt.MapFrom(src => src.Manager != null ? src.Manager.Name : null))
                .ForMember(dest => dest.PharmacyName, opt => opt.MapFrom(src => src.Pharmacy != null ? src.Pharmacy.Name : null))
                .ReverseMap(); // to allow mapping back from DTO to Entity
        }
    }
}
