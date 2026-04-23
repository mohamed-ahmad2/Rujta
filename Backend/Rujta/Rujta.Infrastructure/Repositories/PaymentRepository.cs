
using Microsoft.EntityFrameworkCore;
using Rujta.Application.Interfaces.InterfaceRepositories;
using Rujta.Domain.Entities;
using Rujta.Domain.Enums;
using Rujta.Infrastructure.Data;

namespace Rujta.Infrastructure.Repositories
{
    public class PaymentRepository : GenericRepository<Payment, int>, IPaymentRepository
    {
        private readonly AppDbContext _context;

        public PaymentRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<Payment?> GetByPaymobOrderIdAsync(string paymobOrderId, CancellationToken cancellationToken = default)
            => await _context.Payments
                .FirstOrDefaultAsync(p => p.PaymobOrderId == paymobOrderId, cancellationToken);

        public async Task<Payment?> GetByTransactionIdAsync(string transactionId, CancellationToken cancellationToken = default)
            => await _context.Payments
                .FirstOrDefaultAsync(p => p.PaymobTransactionId == transactionId, cancellationToken);

        public async Task<IEnumerable<Payment>> GetByPharmacyIdAsync(int pharmacyId, CancellationToken cancellationToken = default)
            => await _context.Payments
                .Where(p => p.PharmacyId == pharmacyId)
                .OrderByDescending(p => p.CreatedAt)
                .AsNoTracking()
                .ToListAsync(cancellationToken);

        public async Task<IEnumerable<Payment>> GetByPharmacyAndTypeAsync(int pharmacyId, PaymentType type, CancellationToken cancellationToken = default)
            => await _context.Payments
                .Where(p => p.PharmacyId == pharmacyId && p.Type == type)
                .OrderByDescending(p => p.CreatedAt)
                .AsNoTracking()
                .ToListAsync(cancellationToken);

        public async Task<Payment?> GetByReferenceAsync(PaymentType type, int referenceId, CancellationToken cancellationToken = default)
            => await _context.Payments
                .Where(p => p.Type == type && (
                    (type == PaymentType.Order && p.OrderId == referenceId) ||
                    (type == PaymentType.Subscription && p.SubscriptionId == referenceId) ||
                    (type == PaymentType.Ad && p.AdId == referenceId)
                ))
                .OrderByDescending(p => p.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);
    }
}