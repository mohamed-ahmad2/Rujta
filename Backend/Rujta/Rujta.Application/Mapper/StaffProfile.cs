using AutoMapper;
using Rujta.Application.DTOs.PharmacyDto;
using Rujta.Application.DTOs;
using Rujta.Domain.Common;

namespace Rujta.Application.MappingProfiles
{
    public class StaffProfile : Profile
    {
        public StaffProfile()
        {
            CreateMap<CreatePharmacistDto, Pharmacist>()
                .ForMember(d => d.Name, opt => opt.MapFrom(s => s.Name))
                .ForMember(d => d.Email, opt => opt.MapFrom(s => s.Email))
                .ForMember(d => d.PhoneNumber, opt => opt.MapFrom(s => s.Phone))

                .ForMember(d => d.ManagerId, opt => opt.MapFrom(s => s.ManagerId))

                .ForMember(d => d.Position, opt => opt.MapFrom(s => s.Position))
                .ForMember(d => d.Salary, opt => opt.MapFrom(s => s.Salary))
                .ForMember(d => d.HireDate, opt => opt.MapFrom(s => s.HireDate));

            CreateMap<Pharmacist, PharmacistDto>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.PhoneNumber))
                .ForMember(dest => dest.ManagerID, opt => opt.MapFrom(src => src.ManagerId))
                .ForMember(dest => dest.PharmacyID, opt => opt.MapFrom(src => src.PharmacyId))
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id));
        }
    }
}