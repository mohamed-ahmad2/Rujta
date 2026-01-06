using Google;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Infrastructure.Repositories
{
    public class CustomerRepository : GenericRepository<Customer>, ICustomerRepository
    {
        private readonly AppDbContext _context;

        public CustomerRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<Customer?> GetByPhoneAsync(string phoneNumber, int pharmacyId)
        {
            var normalizedPhone = phoneNumber.Trim();

            return await _context.Customers
                .Include(c => c.Orders)
                .FirstOrDefaultAsync(c =>
                    c.PhoneNumber.Trim() == normalizedPhone &&
                    c.PharmacyId == pharmacyId);
        }


        public async Task<IEnumerable<Order>> GetCustomerOrdersAsync(Guid customerId)
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                .Where(o => o.CustomerId == customerId)
                .ToListAsync();
        }
    }

}
