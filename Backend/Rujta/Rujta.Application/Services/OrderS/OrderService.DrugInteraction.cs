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

            return new OrderDrugInteractionResponseDto
            {
                MlServiceUnavailable = true,
                Interactions = new List<DrugInteractionResultDto>()
            };
        }
    }
}