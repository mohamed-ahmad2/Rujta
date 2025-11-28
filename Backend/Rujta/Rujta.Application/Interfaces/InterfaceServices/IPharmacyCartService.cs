using Rujta.Application.DTOs;
using Rujta.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Rujta.Application.Interfaces.InterfaceServices
{
    public interface IPharmacyCartService
    {
        Task<List<Pharmacy>> GetTopPharmaciesForCartAsync(ItemDto order, double userLat, double userLng, int topK);
    }
}
