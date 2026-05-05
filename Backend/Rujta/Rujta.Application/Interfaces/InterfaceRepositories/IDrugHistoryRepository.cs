using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

// ─────────────────────────────────────────────────────────────────────────────
// FILE: Rujta.Application/Interfaces/IDrugHistoryRepository.cs
// ─────────────────────────────────────────────────────────────────────────────

using Rujta.Application.DTOs;

namespace Rujta.Application.Interfaces;


public interface IDrugHistoryRepository
{

    Task<List<MlDrugInputDto>> GetMedicinesByIdsAsync(
        IEnumerable<int> medicineIds,
        CancellationToken ct = default);


    Task<List<MlDrugInputDto>> GetPatientDrugHistoryAsync(
        Guid patientUserId,
        CancellationToken ct = default);
}