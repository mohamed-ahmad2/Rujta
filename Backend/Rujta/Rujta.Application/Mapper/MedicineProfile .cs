namespace Rujta.Application.Mapper
{
    public class MedicineProfile : Profile
    {
        public MedicineProfile()
        {
            CreateMap<Medicine, MedicineDto>().ReverseMap();
        }
    }
}
