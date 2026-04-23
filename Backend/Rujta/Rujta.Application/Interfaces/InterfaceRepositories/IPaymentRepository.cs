// Rujta.Application/Interfaces/InterfaceRepositories/IPaymentRepository.cs
using Rujta.Domain.Entities;
using Rujta.Domain.Enums;

namespace Rujta.Application.Interfaces.InterfaceRepositories
{
    public interface IPaymentRepository : IGenericRepository<Payment, int>
    {
        Task<Payment?> GetByPaymobOrderIdAsync(string paymobOrderId, CancellationToken cancellationToken = default);
        Task<Payment?> GetByTransactionIdAsync(string transactionId, CancellationToken cancellationToken = default);
        Task<IEnumerable<Payment>> GetByPharmacyIdAsync(int pharmacyId, CancellationToken cancellationToken = default);
        Task<IEnumerable<Payment>> GetByPharmacyAndTypeAsync(int pharmacyId, PaymentType type, CancellationToken cancellationToken = default);
        Task<Payment?> GetByReferenceAsync(PaymentType type, int referenceId, CancellationToken cancellationToken = default);
    }
}