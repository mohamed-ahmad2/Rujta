namespace Rujta.Application.Interfaces.InterfaceServices.IPharmacy
{
    public interface IPharmacySearchService
    {
        Task<List<PharmacyMatchResultDto>> GetRankedPharmaciesAsync(ItemDto order,double userLat,double userLng,int topK);
    }

}
