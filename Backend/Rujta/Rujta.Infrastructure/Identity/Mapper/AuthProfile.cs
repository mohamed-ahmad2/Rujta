using AutoMapper;
using Rujta.Application.DTOs;
using Rujta.Domain.Common;
using Rujta.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Infrastructure.Identity.Mapper
{
    public class AuthProfile : Profile
    {
        public AuthProfile()
        {
            CreateMap<RegisterDTO, ApplicationUser>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.Phone))
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.Name));

            CreateMap<RegisterDTO, User>()
            .ForMember(dest => dest.Id, opt => opt.Ignore());
        }
    }
}
