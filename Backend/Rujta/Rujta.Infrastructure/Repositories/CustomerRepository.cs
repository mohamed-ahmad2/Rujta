namespace Rujta.Infrastructure.Repositories
{
    public class CustomerRepository : GenericRepository<Customer,Guid>, ICustomerRepository
    {
        public CustomerRepository(AppDbContext context) : base(context)
        {}


        public async Task<Customer?> GetByPhoneAsync(string phoneNumber, int pharmacyId)
        {
            var normalizedPhone = phoneNumber.Trim();

            return await _context.People
                .OfType<Customer>()
                .FirstOrDefaultAsync(c =>
                    c.PhoneNumber.Trim() == normalizedPhone &&
                    c.PharmacyId == pharmacyId);
        }
        
        public async Task<IEnumerable<Order>> GetCustomerOrdersAsync(
    Guid customerId,
    int pharmacyId,
    CancellationToken cancellationToken = default)
        {
            return await _context.Orders
                .Where(o => o.CustomerId == customerId && o.PharmacyId == pharmacyId)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Medicine)
                .AsNoTracking()
                .ToListAsync(cancellationToken);
        }

    }
}
