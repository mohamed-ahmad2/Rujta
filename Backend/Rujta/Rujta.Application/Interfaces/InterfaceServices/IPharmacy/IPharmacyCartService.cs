using Rujta.Application.DTOs.OrderDto;
using Rujta.Application.DTOs.PharmacyDto;

namespace Rujta.Application.Interfaces.InterfaceServices.IPharmacy
{
    public interface IPharmacyCartService
    {
        Task<List<PharmacyMatchResultDto>> GetTopPharmaciesForCartAsync(ItemDto order, double userLat, double userLng, int topK);
    }
}
