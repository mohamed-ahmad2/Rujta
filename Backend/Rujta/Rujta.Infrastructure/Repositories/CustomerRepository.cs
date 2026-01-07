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
        private readonly AppDbContext _context;

        public CustomerRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        // جلب عميل بناءً على رقم الهاتف والصيدلية، بدون Include للأوردرات
        public async Task<Customer?> GetByPhoneAsync(string phoneNumber, int pharmacyId)
        {
            var normalizedPhone = phoneNumber.Trim();

            return await _context.People
                .OfType<Customer>()
                .FirstOrDefaultAsync(c =>
                    c.PhoneNumber.Trim() == normalizedPhone &&
                    c.PharmacyId == pharmacyId);
        }


        // جلب جميع الأوردرات الخاصة بالعميل باستخدام الـ UserID
        public async Task<IEnumerable<Order>> GetCustomerOrdersAsync(Guid customerId)
        {
            return await _context.Orders
                .Include(o => o.OrderItems) // Include OrderItems لو تحب تجيب تفاصيل الأدوية
                .Where(o => o.CustomerId == customerId)
                .ToListAsync();
        }
    }
}
