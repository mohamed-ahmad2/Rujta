namespace Rujta.Infrastructure.Repositories
{
    public class OrderRepository : GenericRepository<Order>, IOrderRepository
    {
        

        public OrderRepository(AppDbContext context) : base(context)
        {
           
        }

        public async Task<IEnumerable<Order>> GetOrdersByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                .Include(o => o.Pharmacy)
                .Where(o => o.UserID == userId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync(cancellationToken);
        }

        public async Task<Order?> GetOrderWithItemsAsync(int orderId, CancellationToken cancellationToken = default)
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(i => i.Medicine)
                .Include(o => o.Pharmacy)
                .Include(o => o.User)
                .FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken);
        }

        public async Task<IEnumerable<Order>> GetAllWithItemsAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Medicine) 
                .Include(o => o.Pharmacy)
                .Include(o => o.User)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync(cancellationToken);
        }

    }
}
