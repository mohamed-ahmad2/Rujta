using Rujta.Application.DTOs;
using Rujta.Application.Interfaces;
using Rujta.Application.Interfaces.InterfaceServices;
using Rujta.Domain.Enums;


namespace Rujta.Application.Services
{
    public class ReportService : IReportService
    {
        private readonly IUnitOfWork _unitOfWork;

        public ReportService(IUnitOfWork uow)
        {
            _unitOfWork = uow;
        }

        public async Task<PharmacyReportDto> GetPharmacyReportAsync(
            Guid adminId,
            CancellationToken cancellationToken = default)
        {
            
            var pharmacy = (await _unitOfWork.Pharmacies.FindAsync(p => p.AdminId == adminId, cancellationToken))
                           .FirstOrDefault();

            if (pharmacy == null)
                throw new KeyNotFoundException("Pharmacy not found for this admin.");

            
            var filter = new ReportFilterDto
            {
                PharmacyId = pharmacy.Id,
                From = DateTime.UtcNow.AddDays(-30),
                To = DateTime.UtcNow,
                TopNProducts = 5,
                LowStockThreshold = 10
            };

            
            var orders = (await _unitOfWork.Orders.FindAsync(
                o => o.PharmacyID == pharmacy.Id &&
                     o.OrderDate >= filter.From && o.OrderDate <= filter.To,
                cancellationToken))
                .ToList();

            
            var totalSales = orders.Sum(o => o.TotalPrice);
            var totalOrders = orders.Count;

            var completedOrders = orders.Count(o => o.Status == OrderStatus.Accepted);
            var pendingOrders = orders.Count(o => o.Status == OrderStatus.Pending);
            var canceledOrders = orders.Count(o => o.Status == OrderStatus.CancelledByPharmacy);
            var avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

            var salesSummary = new SalesSummaryDto
            {
                TotalOrders = totalOrders,
                CompletedOrders = completedOrders,
                PendingOrders = pendingOrders,
                CanceledOrders = canceledOrders,
                AverageOrderValue = avgOrderValue
            };

            
            var inventoryItems = (await _unitOfWork.InventoryItems.FindAsync(
                i => i.PharmacyID == pharmacy.Id,
                cancellationToken)).ToList();

            var inventorySummary = new InventorySummaryDto
            {
                TotalItems = inventoryItems.Count,
                LowStockCount = inventoryItems.Count(i => i.Quantity <= filter.LowStockThreshold),
                OutOfStockCount = inventoryItems.Count(i => i.Quantity == 0)
            };

            
            var topProducts = orders
                .SelectMany(o => o.OrderItems)
                .GroupBy(oi => oi.MedicineID)
                .Select(g => new TopProductDto
                {
                    MedicineId = g.Key,
                    MedicineName = g.First().Medicine.Name,
                    QuantitySold = g.Sum(x => x.Quantity),
                    TotalRevenue = g.Sum(x => x.SubTotal)
                })
                .OrderByDescending(x => x.QuantitySold)
                .Take(filter.TopNProducts)
                .ToList();

            
            var lowStockItemDtos = inventoryItems
                .Where(i => i.Quantity <= filter.LowStockThreshold)
                .Select(i => new LowStockItemDto
                {
                    MedicineId = i.MedicineID,
                    MedicineName = i.Medicine?.Name ?? "Unknown Medicine",
                    CurrentStock = i.Quantity,
                    ReorderLevel = filter.LowStockThreshold
                })
                .ToList();


            var expiredItems = inventoryItems
                .Where(i => i.ExpiryDate < DateTime.UtcNow)
                .Select(i => new ExpiredItemDto
                {
                    InventoryItemId = i.Id,
                    MedicineId = i.MedicineID,
                    MedicineName = i.Medicine?.Name ?? "Unknown Medicine",
                    ExpiryDate = i.ExpiryDate,
                    Quantity = i.Quantity
                })
                .ToList();

            var dailySales = orders
                .GroupBy(o => o.OrderDate.Date)
                .Select(g => new DailySalesDto
                {
                    DateLabel = g.Key.ToString("yyyy-MM-dd"),
                    OrdersCount = g.Count(),
                    TotalSales = g.Sum(o => o.TotalPrice)
                })
                .OrderBy(x => x.DateLabel)
                .ToList();

            var alerts = new List<string>();
            if (lowStockItemDtos.Any()) alerts.Add("Some items are low in stock!");
            if (expiredItems.Any()) alerts.Add("Some items are expired!");

            var report = new PharmacyReportDto
            {
                PharmacyId = pharmacy.Id,
                PharmacyName = pharmacy.Name,
                TotalSales = totalSales,
                TotalRevenue = totalSales,
                TotalOrders = totalOrders,
                SalesSummary = salesSummary,
                InventorySummary = inventorySummary,
                TopProducts = topProducts,
                LowStockItems = lowStockItemDtos,
                ExpiredItems = expiredItems,
                DailySales = dailySales,
                Alerts = alerts
            };

            return report;
        }
    }

}
