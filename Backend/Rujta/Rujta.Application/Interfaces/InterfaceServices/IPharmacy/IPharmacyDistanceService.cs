using Rujta.Application.Models;

namespace Rujta.Application.Interfaces.InterfaceServices.IPharmacy
{
    public interface IPharmacyDistanceService
    {
        Task<List<PharmacyRouteResult>> GetNearestPharmaciesRouted(double userLat,double userLon,string mode = "car",int topK = 5);
    }
}