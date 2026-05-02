using Rujta.Application.DTOs.MedicineDtos;
using Rujta.Application.DTOs.PharmacyDtos;

namespace Rujta.Application.Interfaces.InterfaceServices.IPharmacy
{
    public interface IPharmacyService
    {
        Task<IEnumerable<PharmacyDto>> GetAllPharmaciesAsync(
            CancellationToken cancellationToken = default);

        Task<IEnumerable<MedicineDto>> GetMedicinesByPharmacyAsync(
            int pharmacyId);

        Task<MedicineStockDto?> GetMedicineStockAsync(
            int pharmacyId,
            int medicineId);

        Task<IEnumerable<NearestPharmacyDto>> GetNearestPharmaciesRoutedAsync(
            double userLat,
            double userLon,
            string mode = "car",
            int topK = 5);
    }
}
