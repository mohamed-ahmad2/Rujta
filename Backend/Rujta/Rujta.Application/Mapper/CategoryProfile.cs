using Rujta.Application.DTOs.MedicineDtos;

namespace Rujta.Application.Mapper
{
    public class CategoryProfile : Profile
    {
        public CategoryProfile() {
            CreateMap<Category, CategoryDto>().ReverseMap();
        }
    }
}
