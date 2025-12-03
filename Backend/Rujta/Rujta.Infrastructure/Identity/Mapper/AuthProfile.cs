namespace Rujta.Infrastructure.Identity.Mapper
{
    public class AuthProfile : Profile
    {
        public AuthProfile()
        {
            CreateMap<RegisterDto, ApplicationUser>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.Phone))
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.Name));

            CreateMap<RegisterDto, User>()
                .ForMember(dest => dest.Id, opt => opt.Ignore());

            CreateMap<ApplicationUser, ApplicationUserDto>()
                .ForMember(dest => dest.Role, opt => opt.Ignore())
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.FullName))
                .ForMember(dest => dest.Location, opt => opt.MapFrom(src => src.Location))
                .ForMember(dest => dest.DomainPersonId, opt => opt.MapFrom(src => src.DomainPersonId))
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id));

            
            CreateMap<ApplicationUserDto, ApplicationUser>()
                .ForMember(dest => dest.RefreshTokens, opt => opt.Ignore())
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Email));

            CreateMap<RegisterDto, Pharmacist>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Qualification, opt => opt.Ignore()) 
                .ForMember(dest => dest.ExperienceYears, opt => opt.Ignore())
                .ForMember(dest => dest.WorkStartTime, opt => opt.Ignore())
                .ForMember(dest => dest.WorkEndTime, opt => opt.Ignore());
        }
    }
}
