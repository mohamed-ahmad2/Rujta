using Rujta.Domain.Enums;

namespace Rujta.Infrastructure.Repositories
{
    public class OrderRepository : GenericRepository<Order, int>, IOrderRepository
    {
        public OrderRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Order>> GetOrdersByUserIdAsync(
            Guid userId,
            CancellationToken cancellationToken = default)
        {
            return await _context.Orders
                .AsNoTracking()
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Medicine)
                .Include(o => o.Pharmacy)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync(cancellationToken);
        }

        public async Task<Order?> GetOrderWithItemsAsync(
            int orderId,
            CancellationToken cancellationToken = default)
        {
            return await _context.Orders
                .AsNoTracking()
                .Include(o => o.OrderItems)
                    .ThenInclude(i => i.Medicine)
                .Include(o => o.Pharmacy)
                .Include(o => o.User)
                .FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken);
        }

        public async Task<IEnumerable<Order>> GetAllWithItemsAsync(
            CancellationToken cancellationToken = default)
        {
            return await _context.Orders
                .AsNoTracking()
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Medicine)
                .Include(o => o.Pharmacy)
                .Include(o => o.User)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync(cancellationToken);
        }

        // ── FIX: removed .Include(o => o.User) to prevent circular reference
        // and N+1 loading that caused infinite loading on the pharmacy dashboard.
        // PharmacyName is already available via o.Pharmacy.Name.
        // UserName is mapped from o.User.Name in the service layer via
        // a separate lightweight query if needed, or included in OrderDto directly.
        public async Task<IEnumerable<Order>> GetOrdersByPharmacyIdAsync(
            int pharmacyId,
            CancellationToken cancellationToken = default)
        {
            return await _context.Orders
                .AsNoTracking()
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Medicine)
                .Include(o => o.Pharmacy)
                .Where(o => o.PharmacyId == pharmacyId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<Order>> GetOrdersByCustomerAsync(
            Guid customerId)
        {
            return await _context.Orders
                .AsNoTracking()
                .Include(o => o.OrderItems)
                .Where(o => o.UserId == customerId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<int>> GetUserPurchasedMedicineIdsAsync(
            Guid userId,
            CancellationToken cancellationToken = default)
        {
            return await _context.Orders
                .AsNoTracking()
                .Where(o => o.UserId == userId && o.Status == OrderStatus.Delivered)
                .SelectMany(o => o.OrderItems)
                .GroupBy(i => i.MedicineID)
                .OrderByDescending(g => g.Count())
                .Select(g => g.Key)
                .ToListAsync(cancellationToken);
        }
    }
}