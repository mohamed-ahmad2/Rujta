using Microsoft.Extensions.Logging;
using Rujta.Application.DTOs;

namespace Rujta.Application.Services.Logging
{
    public static class PharmacySearchLogger
    {
        public static void LogStart(
            ILogger logger,
            double lat,
            double lng,
            int topK)
        {
            logger.LogInformation("=== Start GetRankedPharmaciesAsync ===");
            logger.LogInformation(
                "User location: Lat={Lat}, Lng={Lng}, topK={TopK}",
                lat, lng, topK);
        }

        public static void LogOrderItem(
            ILogger logger,
            CartItemDto item,
            int index)
        {
            logger.LogInformation(
                "Order item {Index}: MedicineId={MedicineId}, Quantity={Quantity}",
                index, item.MedicineId, item.Quantity);
        }

        public static void LogStockCheck(
            ILogger logger,
            int pharmacyId,
            CartItemDto item,
            int stock)
        {
            if (stock == 0)
            {
                logger.LogWarning(
                    "MedicineId={MedicineId} stock is zero in PharmacyId={PharmacyId}. Possibly missing in InventoryItems table",
                    item.MedicineId, pharmacyId);
            }
            else if (stock < item.Quantity)
            {
                logger.LogWarning(
                    "MedicineId={MedicineId} not enough stock. Needed {Needed}, Available {Available}",
                    item.MedicineId, item.Quantity, stock);
            }
        }

        public static void LogPharmacyProcessing(
            ILogger logger,
            int pharmacyId,
            string name,
            double distanceKm)
        {
            logger.LogInformation(
                "Processing PharmacyId={PharmacyId}, Name={Name}, ApproxDistance={DistanceKm}km",
                pharmacyId, name, distanceKm);
        }

        public static void LogFinalResults(
            ILogger logger,
            int count)
        {
            logger.LogInformation(
                "=== Returning {Count} ranked pharmacy results ===",
                count);
        }
    }
}
