using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

// ─────────────────────────────────────────────────────────────────────────────
// FILE: Rujta.Infrastructure/Repositories/DrugHistoryRepository.cs
// ─────────────────────────────────────────────────────────────────────────────

using Microsoft.EntityFrameworkCore;
using Rujta.Application.DTOs;
using Rujta.Application.Interfaces;
using Rujta.Infrastructure.Data;

namespace Rujta.Infrastructure.Repositories;

public class DrugHistoryRepository : IDrugHistoryRepository
{
    private readonly AppDbContext _db;

    public DrugHistoryRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<MlDrugInputDto>> GetMedicinesByIdsAsync(
        IEnumerable<int> medicineIds,
        CancellationToken ct = default)
    {
        var idList = medicineIds.Distinct().ToList();

        return await _db.Medicines
            .Where(m => idList.Contains(m.Id) && m.Smiles != null)
            .Select(m => new MlDrugInputDto
            {
                Id = m.Id.ToString(),
                Name = m.Name,
                Smiles = m.Smiles!
            })
            .ToListAsync(ct);
    }

    public async Task<List<MlDrugInputDto>> GetPatientDrugHistoryAsync(
        Guid patientUserId,
        CancellationToken ct = default)
    {
        return await _db.OrderItems
            .Include(oi => oi.Order)
            .Include(oi => oi.Medicine)
            .Where(oi =>
                oi.Order.UserId == patientUserId &&
                oi.Medicine.Smiles != null)
            .Select(oi => new MlDrugInputDto
            {
                Id = oi.Medicine.Id.ToString(),
                Name = oi.Medicine.Name,
                Smiles = oi.Medicine.Smiles!
            })
            .GroupBy(d => d.Id)
            .Select(g => g.First())
            .ToListAsync(ct);
    }
}
