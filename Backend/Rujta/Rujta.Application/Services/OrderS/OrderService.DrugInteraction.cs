// ─────────────────────────────────────────────────────────────────────────────
// FILE: Rujta.Application/Services/OrderS/OrderService.DrugInteraction.cs
//
// This is a PARTIAL CLASS — it extends your existing OrderService.
// It adds the drug interaction check that runs when an order is created.
// ─────────────────────────────────────────────────────────────────────────────

using Rujta.Application.DTOs;
using Rujta.Application.Interfaces.InterfaceServices;
using Microsoft.Extensions.Logging;

namespace Rujta.Application.Services.OrderS;

public partial class OrderService
{

    public async Task<OrderDrugInteractionResponseDto> CheckDrugInteractionsForOrderAsync(
        IEnumerable<int> medicineIds,
        Guid patientUserId,
        double threshold = 0.5,
        CancellationToken ct = default)
    {
        try
        {
            return await _drugInteractionService.CheckOrderInteractionsAsync(
                medicineIds,
                patientUserId,
                threshold,
                ct
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Drug interaction check failed for user {UserId}", patientUserId);

            // Return safe default — don't block order creation if check fails
            return new OrderDrugInteractionResponseDto
            {
                MlServiceUnavailable = true,
                Interactions = new List<DrugInteractionResultDto>()
            };
        }
    }
}