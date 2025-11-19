using Rujta.Application.DTOs;
using Rujta.Application.Interfaces;
using Rujta.Application.Interfaces.InterfaceServices;
using Rujta.Domain.Entities;
using Rujta.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Rujta.Application.Services
{
    public class ReportService : IReportService
    {
        private readonly IUnitOfWork _uow;

        public ReportService(IUnitOfWork uow)
        {
            _uow = uow;
        }

        public async Task<PharmacyReportDto> GetPharmacyReportAsync(
            Guid adminId,
            CancellationToken cancellationToken = default)
        {
            // 1️⃣ جلب الصيدلية المرتبطة بالـ Admin
            var pharmacy = (await _uow.Pharmacies.FindAsync(p => p.AdminId == adminId, cancellationToken))
                           .FirstOrDefault();

            if (pharmacy == null)
                throw new KeyNotFoundException("Pharmacy not found for this admin.");

            // 2️⃣ بناء filter داخليًا
            var filter = new ReportFilterDto
            {
                PharmacyId = pharmacy.Id,
                From = DateTime.UtcNow.AddDays(-30),
                To = DateTime.UtcNow,
                TopNProducts = 5,
                LowStockThreshold = 10
            };

            // 3️⃣ جلب الطلبات ضمن الفترة المحددة
            var orders = (await _uow.Orders.FindAsync(
                o => o.PharmacyID == pharmacy.Id &&
                     o.OrderDate >= filter.From && o.OrderDate <= filter.To,
                cancellationToken))
                .ToList();

            // 4️⃣ حساب إجمالي المبيعات وعدد الطلبات
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

            // 5️⃣ جلب عناصر المخزون
            var inventoryItems = (await _uow.InventoryItems.FindAsync(
                i => i.PharmacyID == pharmacy.Id,
                cancellationToken)).ToList();

            var inventorySummary = new InventorySummaryDto
            {
                TotalItems = inventoryItems.Count,
                LowStockCount = inventoryItems.Count(i => i.Quantity <= filter.LowStockThreshold),
                OutOfStockCount = inventoryItems.Count(i => i.Quantity == 0)
            };

            // 6️⃣ TopProducts
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

            // 7️⃣ LowStockItems
            var lowStockItemDtos = inventoryItems
                .Where(i => i.Quantity <= filter.LowStockThreshold)
                .Select(i => new LowStockItemDto
                {
                    MedicineId = i.MedicineID,
                    MedicineName = i.Medicine.Name,
                    CurrentStock = i.Quantity,
                    ReorderLevel = filter.LowStockThreshold
                })
                .ToList();

            // 8️⃣ ExpiredItems
            var expiredItems = inventoryItems
                .Where(i => i.ExpiryDate < DateTime.UtcNow)
                .Select(i => new ExpiredItemDto
                {
                    InventoryItemId = i.Id,
                    MedicineId = i.MedicineID,
                    MedicineName = i.Medicine.Name,
                    ExpiryDate = i.ExpiryDate,
                    Quantity = i.Quantity
                })
                .ToList();

            // 9️⃣ DailySales chart
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

            // 🔟 Alerts
            var alerts = new List<string>();
            if (lowStockItemDtos.Any()) alerts.Add("Some items are low in stock!");
            if (expiredItems.Any()) alerts.Add("Some items are expired!");

            // 1️⃣1️⃣ إنشاء التقرير النهائي
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
