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
<<<<<<< HEAD
            CreateMap<RegisterDTO, ApplicationUser>()
=======
            CreateMap<RegisterDto, ApplicationUser>()
>>>>>>> origin/main
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.Phone))
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.Name));

<<<<<<< HEAD
            CreateMap<RegisterDTO, User>()
=======
            CreateMap<RegisterDto, User>()
>>>>>>> origin/main
            .ForMember(dest => dest.Id, opt => opt.Ignore());
        }
    }
}
