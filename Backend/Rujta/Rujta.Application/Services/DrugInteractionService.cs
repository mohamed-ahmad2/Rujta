// ─────────────────────────────────────────────────────────────────────────────
// FILE: Rujta.Application/Services/DrugInteractionService.cs
// ─────────────────────────────────────────────────────────────────────────────

using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Rujta.Application.DTOs;
using Rujta.Application.Interfaces;
using Rujta.Application.Interfaces.InterfaceServices;
using Rujta.Domain.Entities;

namespace Rujta.Application.Services;

public class DrugInteractionService : IDrugInteractionService
{
    private readonly HttpClient _http;
    private readonly ILogger<DrugInteractionService> _logger;
    private readonly IDrugHistoryRepository _drugHistoryRepo;

    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        PropertyNameCaseInsensitive = true,
    };

    public DrugInteractionService(
        HttpClient httpClient,
        ILogger<DrugInteractionService> logger,
        IDrugHistoryRepository drugHistoryRepo)
    {
        _http = httpClient;
        _logger = logger;
        _drugHistoryRepo = drugHistoryRepo;
    }

    // ── PAGE 2: Check new order drugs against patient history ────────────────
    public async Task<OrderDrugInteractionResponseDto> CheckOrderInteractionsAsync(
        IEnumerable<int> newOrderMedicineIds,
        Guid patientUserId,
        double threshold = 0.5,
        CancellationToken ct = default)
    {
        var newMedicines = await _drugHistoryRepo
            .GetMedicinesByIdsAsync(newOrderMedicineIds, ct);

        var historicalMedicines = await _drugHistoryRepo
            .GetPatientDrugHistoryAsync(patientUserId, ct);

        // Medicine.Id is string — track new-order IDs in a HashSet<string>
        var newIds = newMedicines.Select(m => m.Id).ToHashSet();

        // FIX 1: Exclude drugs already in the new order from history
        //        to avoid duplicate pairs and wrong IsFromHistory flags
        var uniqueHistorical = historicalMedicines
            .Where(h => !newIds.Contains(h.Id))
            .ToList();

        _logger.LogInformation(
            "Drug interaction check — new: {New}, unique history: {History}",
            newMedicines.Count, uniqueHistorical.Count);

        // Need at least one new drug and one history drug to compare
        if (newMedicines.Count == 0 || uniqueHistorical.Count == 0)
        {
            return new OrderDrugInteractionResponseDto
            {
                TotalDrugsChecked = newMedicines.Count + uniqueHistorical.Count,
                TotalPairsChecked = 0,
                InteractionsFound = 0,
                Interactions = new List<DrugInteractionResultDto>()
            };
        }

        // FIX 2: Only build cross pairs — new x history (not new×new or history×history)
        var pairs = newMedicines
            .SelectMany(newDrug => uniqueHistorical.Select(histDrug => new
            {
                smiles1 = newDrug.Smiles,
                name1 = newDrug.Name,
                smiles2 = histDrug.Smiles,
                name2 = histDrug.Name,
            }))
            .ToList();

        // FIX 3: Include threshold in the ML request body
        var batchRequest = new { pairs, threshold };

        BatchMlResponseDto? mlResponse = null;
        bool mlUnavailable = false;

        try
        {
            var httpResponse = await _http.PostAsJsonAsync(
                "/predict/batch", batchRequest, _jsonOptions, ct);

            httpResponse.EnsureSuccessStatusCode();

            mlResponse = await httpResponse.Content
                .ReadFromJsonAsync<BatchMlResponseDto>(_jsonOptions, ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "ML service unavailable");
            mlUnavailable = true;
        }

        if (mlUnavailable || mlResponse is null)
            return new OrderDrugInteractionResponseDto
            {
                TotalDrugsChecked = newMedicines.Count + uniqueHistorical.Count,
                MlServiceUnavailable = true,
                Interactions = new List<DrugInteractionResultDto>()
            };

        // Combined lookup list for resolving ML result names back to entities
        var allDrugs = newMedicines.Concat(uniqueHistorical).ToList();

        // FIX 4 + 5: Id is string so use int.TryParse for the DTO int field.
        //            IsFromHistory uses string HashSet comparison — works correctly now.
        var interactions = mlResponse.Results
            .Where(r => r.Interaction == true && r.Error == null)
            .Select(r =>
            {
                var drug1 = allDrugs.FirstOrDefault(d => d.Name == r.Drug1);
                var drug2 = allDrugs.FirstOrDefault(d => d.Name == r.Drug2);

                return new DrugInteractionResultDto
                {
                    Drug1Id = int.TryParse(drug1?.Id, out var id1) ? id1 : 0,
                    Drug1Name = r.Drug1,
                    Drug1IsFromHistory = drug1 != null && !newIds.Contains(drug1.Id),

                    Drug2Id = int.TryParse(drug2?.Id, out var id2) ? id2 : 0,
                    Drug2Name = r.Drug2,
                    Drug2IsFromHistory = drug2 != null && !newIds.Contains(drug2.Id),

                    Probability = r.Probability ?? 0,
                    Interacts = r.Interaction ?? false,
                    Confidence = r.Confidence,
                };
            })
            .ToList();

        return new OrderDrugInteractionResponseDto
        {
            TotalDrugsChecked = newMedicines.Count + uniqueHistorical.Count,
            TotalPairsChecked = mlResponse.Total,
            InteractionsFound = interactions.Count,
            Interactions = interactions,
        };
    }

    // ── PAGE 1: Check interactions within the new order only ─────────────────
    public async Task<OrderDrugInteractionResponseDto> CheckNewOrderOnlyAsync(
        IEnumerable<int> medicineIds,
        double threshold = 0.5,
        CancellationToken ct = default)
    {
        var drugs = await _drugHistoryRepo.GetMedicinesByIdsAsync(medicineIds, ct);

        if (drugs.Count < 2)
            return new OrderDrugInteractionResponseDto
            {
                TotalDrugsChecked = drugs.Count,
                TotalPairsChecked = 0,
                InteractionsFound = 0,
                Interactions = new List<DrugInteractionResultDto>()
            };

        // All pairs within the new order — correct for page 1
        var pairs = new List<object>();
        for (int i = 0; i < drugs.Count; i++)
            for (int j = i + 1; j < drugs.Count; j++)
                pairs.Add(new
                {
                    smiles1 = drugs[i].Smiles,
                    name1 = drugs[i].Name,
                    smiles2 = drugs[j].Smiles,
                    name2 = drugs[j].Name,
                });

        // FIX 3: Include threshold in the ML request body
        var batchRequest = new { pairs, threshold };

        BatchMlResponseDto? mlResponse = null;

        try
        {
            var httpResponse = await _http.PostAsJsonAsync(
                "/predict/batch", batchRequest, _jsonOptions, ct);
            httpResponse.EnsureSuccessStatusCode();
            mlResponse = await httpResponse.Content
                .ReadFromJsonAsync<BatchMlResponseDto>(_jsonOptions, ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "ML service unavailable");
            return new OrderDrugInteractionResponseDto
            {
                TotalDrugsChecked = drugs.Count,
                MlServiceUnavailable = true,
                Interactions = new List<DrugInteractionResultDto>()
            };
        }

        var interactions = mlResponse!.Results
            .Where(r => r.Interaction == true && r.Error == null)
            .Select(r =>
            {
                var drug1 = drugs.FirstOrDefault(d => d.Name == r.Drug1);
                var drug2 = drugs.FirstOrDefault(d => d.Name == r.Drug2);

                return new DrugInteractionResultDto
                {
                    Drug1Id = int.TryParse(drug1?.Id, out var id1) ? id1 : 0,
                    Drug1Name = r.Drug1,
                    Drug1IsFromHistory = false, // always false — no history involved here

                    Drug2Id = int.TryParse(drug2?.Id, out var id2) ? id2 : 0,
                    Drug2Name = r.Drug2,
                    Drug2IsFromHistory = false,

                    Probability = r.Probability ?? 0,
                    Interacts = r.Interaction ?? false,
                    Confidence = r.Confidence,
                };
            })
            .ToList();

        return new OrderDrugInteractionResponseDto
        {
            TotalDrugsChecked = drugs.Count,
            TotalPairsChecked = mlResponse.Total,
            InteractionsFound = interactions.Count,
            Interactions = interactions,
        };
    }

    // ── Health check ──────────────────────────────────────────────────────────
    public async Task<bool> IsMlServiceHealthyAsync(CancellationToken ct = default)
    {
        try
        {
            var response = await _http.GetAsync("/health", ct);
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }
}