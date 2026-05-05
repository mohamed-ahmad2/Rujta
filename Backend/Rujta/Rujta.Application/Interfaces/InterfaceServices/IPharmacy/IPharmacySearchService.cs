using Rujta.Application.DTOs.OrderDto;
using Rujta.Application.DTOs.PharmacyDto;

namespace Rujta.Application.Interfaces.InterfaceServices.IPharmacy
{
    public interface IPharmacySearchService
    {
        Task<List<PharmacyMatchResultDto>> GetRankedPharmaciesAsync(ItemDto order,double userLat,double userLng,int topK);
    }

}
