// Rujta.Application/Interfaces/InterfaceServices/IPaymentService.cs
using Rujta.Application.DTOs.PaymentDto;
using Rujta.Domain.Enums;

namespace Rujta.Application.Interfaces.InterfaceServices
{
    public interface IPaymentService
    {
        Task<PaymentResponseDto> InitiateAsync(Guid userId, int pharmacyId, InitiatePaymentDto dto, CancellationToken cancellationToken = default);
        Task<bool> HandleCallbackAsync(PaymobCallbackDto callback, string hmacSignature, CancellationToken cancellationToken = default);
        Task<IEnumerable<PaymentSummaryDto>> GetPharmacyPaymentsAsync(int pharmacyId, CancellationToken cancellationToken = default);
        Task<IEnumerable<PaymentSummaryDto>> GetPharmacyPaymentsByTypeAsync(int pharmacyId, PaymentType type, CancellationToken cancellationToken = default);
    }
}