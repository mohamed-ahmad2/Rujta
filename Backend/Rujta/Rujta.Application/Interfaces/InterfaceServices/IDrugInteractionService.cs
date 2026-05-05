using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Rujta.Application.DTOs;

namespace Rujta.Application.Interfaces.InterfaceServices;

public interface IDrugInteractionService
{

    Task<OrderDrugInteractionResponseDto> CheckOrderInteractionsAsync(
        IEnumerable<int> newOrderMedicineIds,
        Guid patientUserId,
        double threshold = 0.5,
        CancellationToken ct = default
    );
    Task<bool> IsMlServiceHealthyAsync(CancellationToken ct = default);
}
