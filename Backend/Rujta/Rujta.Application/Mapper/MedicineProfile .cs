using AutoMapper;
using Rujta.Application.DTOs;
using Rujta.Domain.Entities;


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
