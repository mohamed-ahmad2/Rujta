using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.Mapper
{
   public class DrugRequestMappingProfile : Profile
    {
        public DrugRequestMappingProfile()
        {
            // CreateDrugRequestDto  →  DrugRequest entity
            CreateMap<CreateDrugRequestDto, DrugRequest>();

            // DrugRequest entity  →  DrugRequestDto (response)
            CreateMap<DrugRequest, DrugRequestDto>()
                .ForMember(dest => dest.Status,
                           opt => opt.MapFrom(src => src.Status.ToString()));
        }
    }
}
