using Rujta.Application.DTOs.OrderDto;
using Rujta.Application.DTOs.PharmacyDto;
using Rujta.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Rujta.Application.Interfaces.InterfaceServices.IPharmacy
{
    public interface IPharmacyCartService
    {
        Task<List<PharmacyMatchResultDto>> GetTopPharmaciesForCartAsync(ItemDto order, double userLat, double userLng, int topK);
    }
}
