using Rujta.Application.DTOs;
using Rujta.Domain.Entities;

namespace Rujta.Application.Interfaces.InterfaceServices
{
    public interface IPharmacySearchService
    {
        Task<List<Pharmacy>> GetRankedPharmaciesAsync(ItemDto order, double userLat, double userLng, int topK);
    }
}
