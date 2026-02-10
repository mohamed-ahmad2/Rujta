using Microsoft.EntityFrameworkCore;
using Rujta.Application.DTOs;
using Rujta.Application.Interfaces.InterfaceRepositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Rujta.Application.Services
{
    public class ReportService : IReportService
    {
        private readonly IUnitOfWork _unitOfWork;

        public ReportService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<PharmacyReportDto> GetPharmacyReportAsync(
            int pharmacyId,
            CancellationToken cancellationToken = default)
        {
            // ===== Get pharmacy =====
            var pharmacy = await _unitOfWork.Pharmacies.GetByIdAsync(pharmacyId, cancellationToken);
            if (pharmacy == null)
                throw new KeyNotFoundException("Pharmacy not found.");

            var filter = new ReportFilterDto
            {
                PharmacyId = pharmacy.Id,
                From = DateTime.UtcNow.AddDays(-30),
                To = DateTime.UtcNow,
                TopNProducts = 5,
                LowStockThreshold = 10
            };

            // ===== Orders with items & medicines =====
            var orders = await _unitOfWork.Orders
                .GetQueryable()
                .Where(o => o.PharmacyId == pharmacy.Id &&
                            o.OrderDate >= filter.From &&
                            o.OrderDate <= filter.To)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Medicine)
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            // ===== Sales Summary =====
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

            // ===== Inventory Items with medicines included =====
            var inventoryItems = await _unitOfWork.InventoryItems
                .GetQueryable()
                .Where(i => i.PharmacyID == pharmacy.Id)
                .Include(i => i.Medicine) // Include medicine to avoid null
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            var inventorySummary = new InventorySummaryDto
            {
                TotalItems = inventoryItems.Count,
                LowStockCount = inventoryItems.Count(i => i.Quantity <= filter.LowStockThreshold),
                OutOfStockCount = inventoryItems.Count(i => i.Quantity == 0)
            };

            // ===== Top Selling Products =====
            var topProducts = orders
                .SelectMany(o => o.OrderItems)
                .Where(oi => oi.Medicine != null) // only include valid medicines
                .GroupBy(oi => oi.MedicineID)
                .Select(g => new TopProductDto
                {
                    MedicineId = g.Key,
                    MedicineName = g.First().Medicine.Name, // safe because we filtered null
                    QuantitySold = g.Sum(x => x.Quantity),
                    TotalRevenue = g.Sum(x => x.SubTotal)
                })
                .OrderByDescending(x => x.QuantitySold)
                .Take(filter.TopNProducts)
                .ToList();

            // ===== Low Stock Items =====
            var lowStockItems = inventoryItems
                .Where(i => i.Quantity <= filter.LowStockThreshold)
                .Select(i => new LowStockItemDto
                {
                    MedicineId = i.MedicineID,
                    MedicineName = i.Medicine?.Name ?? $"Medicine #{i.MedicineID}",
                    CurrentStock = i.Quantity,
                    ReorderLevel = filter.LowStockThreshold
                })
                .ToList();

            // ===== Expired Items =====
            var expiredItems = inventoryItems
                .Where(i => i.ExpiryDate < DateTime.UtcNow)
                .Select(i => new ExpiredItemDto
                {
                    InventoryItemId = i.Id,
                    MedicineId = i.MedicineID,
                    MedicineName = i.Medicine?.Name ?? $"Medicine #{i.MedicineID}",
                    ExpiryDate = i.ExpiryDate,
                    Quantity = i.Quantity
                })
                .ToList();

            // ===== Daily Sales =====
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

            // ===== Alerts =====
            var alerts = new List<string>();
            if (lowStockItems.Any()) alerts.Add("Some items are low in stock!");
            if (expiredItems.Any()) alerts.Add("Some items are expired!");

            // ===== Build Report =====
            return new PharmacyReportDto
            {
                PharmacyId = pharmacy.Id,
                PharmacyName = pharmacy.Name,
                TotalSales = totalSales,
                TotalRevenue = totalSales,
                TotalOrders = totalOrders,
                SalesSummary = salesSummary,
                InventorySummary = inventorySummary,
                TopProducts = topProducts,
                LowStockItems = lowStockItems,
                ExpiredItems = expiredItems,
                DailySales = dailySales,
                Alerts = alerts
            };
        }
    }
}
