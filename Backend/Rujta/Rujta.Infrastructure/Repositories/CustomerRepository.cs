using Google;
using Microsoft.EntityFrameworkCore;
using Rujta.Domain.Entities;
using Rujta.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Rujta.Infrastructure.Repositories
{
    public class CustomerRepository : GenericRepository<Customer>, ICustomerRepository
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

        public async Task<IEnumerable<Order>> GetCustomerOrdersAsync(Guid customerId) =>
            await _context.Orders
                .Include(o => o.OrderItems)
                .Where(o => o.CustomerId == customerId)
                .ToListAsync();
        
    }
}
