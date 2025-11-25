using AutoMapper;
using Rujta.Application.DTOs;
using Rujta.Domain.Entities;

public class StaffProfile : Profile
{
    public StaffProfile()
    {
        CreateMap<StaffDto, Staff>()
            .ForAllMembers(opts =>
                opts.Condition((src, dest, srcMember) => srcMember != null));

        CreateMap<Staff, StaffDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id));
    }
}
