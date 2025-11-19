using Microsoft.EntityFrameworkCore;
using Rujta.Application.DTOs;
using Rujta.Application.Interfaces.InterfaceRepositories;
using Rujta.Domain.Entities;
using Rujta.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Rujta.Infrastructure.Repositories
{
    public class ReportRepository : IReportRepository
    {
        private readonly AppDbContext _context;

        public ReportRepository(AppDbContext context)
        {
            _context = context;
        }

        // ============================================
        // ROOT REPORT FUNCTION
        // ============================================
        public async Task<PharmacyReportDto> GetPharmacyReportAsync(
            ReportFilterDto filter,
            CancellationToken cancellationToken = default)
        {
            var pharmacy = await _context.Pharmacies
                .FirstOrDefaultAsync(p => p.Id == filter.PharmacyId, cancellationToken);

            if (pharmacy == null)
                throw new KeyNotFoundException("Pharmacy not found.");

            var report = new PharmacyReportDto
            {
                PharmacyId = pharmacy.Id,
                PharmacyName = pharmacy.Name
            };

            // -----------------------------
            // 1) Total Orders + Sales Summary
            // -----------------------------
            var orders = await _context.Orders
                .Where(o => o.PharmacyID == filter.PharmacyId &&
                            o.OrderDate >= filter.From &&
                            o.OrderDate <= filter.To)
                .ToListAsync(cancellationToken);

            report.TotalOrders = orders.Count;
            report.SalesSummary.TotalOrders = orders.Count;
            report.SalesSummary.CompletedOrders = orders.Count(o => o.Status == OrderStatus.Accepted);
            report.SalesSummary.PendingOrders = orders.Count(o => o.Status == OrderStatus.Pending);
            report.SalesSummary.CanceledOrders = orders.Count(o => o.Status == OrderStatus.CancelledByPharmacy);

            if (orders.Count > 0)
                report.SalesSummary.AverageOrderValue = orders.Average(o => o.TotalPrice);

            // -----------------------------
            // 2) Total Sales / Revenue
            // -----------------------------
            report.TotalSales = orders.Sum(o => o.TotalPrice);
            report.TotalRevenue = report.TotalSales; // لو عندك logic مختلف بدّله هنا

            // -----------------------------
            // 3) Top Products
            // -----------------------------
            report.TopProducts = (await GetTopProductsAsync(
                    filter.PharmacyId,
                    filter.TopNProducts,
                    filter.From,
                    filter.To,
                    cancellationToken))
                .ToList();

            // -----------------------------
            // 4) Low Stock Items
            // -----------------------------
            report.LowStockItems = (await GetLowStockItemsAsync(
                    filter.PharmacyId,
                    filter.LowStockThreshold,
                    cancellationToken))
                .ToList();

            // -----------------------------
            // 5) Expired Items
            // -----------------------------
            report.ExpiredItems = (await GetExpiredItemsAsync(
                    filter.PharmacyId,
                    cancellationToken))
                .ToList();

            // -----------------------------
            // 6) Daily sales chart
            // -----------------------------
            report.DailySales = (await GetDailySalesAsync(
                    filter.PharmacyId,
                    filter.From,
                    filter.To,
                    cancellationToken))
                .ToList();

            // -----------------------------
            // 7) Inventory Summary
            // -----------------------------
            var inventory = await _context.InventoryItems
                .Where(i => i.PharmacyID == filter.PharmacyId)
                .ToListAsync(cancellationToken);

            report.InventorySummary.TotalItems = inventory.Count;
            report.InventorySummary.LowStockCount = inventory.Count(i => i.Quantity < filter.LowStockThreshold);
            report.InventorySummary.OutOfStockCount = inventory.Count(i => i.Quantity == 0);

            return report;
        }

        // ============================================
        // TOP PRODUCTS
        // ============================================
        public async Task<IEnumerable<TopProductDto>> GetTopProductsAsync(
            int pharmacyId,
            int topN,
            DateTime from,
            DateTime to,
            CancellationToken cancellationToken = default)
        {
            return await _context.OrderItems
                .Where(oi =>
                    oi.Order.PharmacyID == pharmacyId &&
                    oi.Order.OrderDate >= from &&
                    oi.Order.OrderDate <= to)
                .GroupBy(oi => new { oi.MedicineID, oi.Medicine.Name })
                .Select(g => new TopProductDto
                {
                    MedicineId = g.Key.MedicineID,
                    MedicineName = g.Key.Name,
                    QuantitySold = g.Sum(x => x.Quantity),
                    TotalRevenue = g.Sum(x => x.Quantity * x.PricePerUnit)
                })
                .OrderByDescending(x => x.QuantitySold)
                .Take(topN)
                .ToListAsync(cancellationToken);
        }

        // ============================================
        // LOW STOCK ITEMS
        // ============================================
        public async Task<IEnumerable<LowStockItemDto>> GetLowStockItemsAsync(
            int pharmacyId,
            int threshold,
            CancellationToken cancellationToken = default)
        {
            return await _context.InventoryItems
                .Where(i => i.PharmacyID == pharmacyId && i.Quantity <= threshold)
                .Include(i => i.Medicine)
                .Select(i => new LowStockItemDto
                {
                    MedicineId = i.MedicineID,
                    MedicineName = i.Medicine.Name,
                    CurrentStock = i.Quantity,
                    ReorderLevel = threshold
                })
                .ToListAsync(cancellationToken);
        }

        // ============================================
        // EXPIRED ITEMS
        // ============================================
        public async Task<IEnumerable<ExpiredItemDto>> GetExpiredItemsAsync(
            int pharmacyId,
            CancellationToken cancellationToken = default)
        {
            var today = DateTime.UtcNow.Date;

            return await _context.InventoryItems
                .Where(i => i.PharmacyID == pharmacyId && i.ExpiryDate < today)
                .Include(i => i.Medicine)
                .Select(i => new ExpiredItemDto
                {
                    InventoryItemId = i.Id,
                    MedicineId = i.MedicineID,
                    MedicineName = i.Medicine.Name,
                    ExpiryDate = i.ExpiryDate,
                    Quantity = i.Quantity
                })
                .ToListAsync(cancellationToken);
        }

        // ============================================
        // DAILY SALES
        // ============================================
        public async Task<IEnumerable<DailySalesDto>> GetDailySalesAsync(
            int pharmacyId,
            DateTime from,
            DateTime to,
            CancellationToken cancellationToken = default)
        {
            return await _context.Orders
                .Where(o =>
                    o.PharmacyID == pharmacyId &&
                    o.OrderDate >= from &&
                    o.OrderDate <= to &&
                    o.Status == OrderStatus.Accepted)
                .GroupBy(o => o.OrderDate.Date)
                .Select(g => new DailySalesDto
                {
                    DateLabel = g.Key.ToString("yyyy-MM-dd"),
                    TotalSales = g.Sum(o => o.TotalPrice),
                    OrdersCount = g.Count()
                })
                .OrderBy(x => x.DateLabel)
                .ToListAsync(cancellationToken);
        }
    }
}

