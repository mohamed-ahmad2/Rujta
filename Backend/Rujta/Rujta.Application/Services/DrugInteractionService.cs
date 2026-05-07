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

        var newIds = newMedicines.Select(m => m.Id).ToHashSet();

        var allDrugs = newMedicines
            .Concat(historicalMedicines)
            .GroupBy(d => d.Id)
            .Select(g => g.First())
            .ToList();

        _logger.LogInformation(
            "Drug interaction check — new: {New}, history: {History}, total unique: {Total}",
            newMedicines.Count, historicalMedicines.Count, allDrugs.Count);

        if (allDrugs.Count < 2)
        {
            return new OrderDrugInteractionResponseDto
            {
                TotalDrugsChecked = allDrugs.Count,
                TotalPairsChecked = 0,
                InteractionsFound = 0,
                Interactions = new List<DrugInteractionResultDto>()
            };
        }

        var pairs = new List<object>();
        for (int i = 0; i < allDrugs.Count; i++)
            for (int j = i + 1; j < allDrugs.Count; j++)
                pairs.Add(new
                {
                    smiles1 = allDrugs[i].Smiles,
                    name1 = allDrugs[i].Name,
                    smiles2 = allDrugs[j].Smiles,
                    name2 = allDrugs[j].Name,
                });

        var batchRequest = new { pairs };
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
                TotalDrugsChecked = allDrugs.Count,
                MlServiceUnavailable = true,
                Interactions = new List<DrugInteractionResultDto>()
            };

        var interactions = mlResponse.Results
            .Where(r => r.Interaction == true && r.Error == null)
            .Select(r => new DrugInteractionResultDto
            {
                Drug1Id = int.TryParse(allDrugs.FirstOrDefault(d => d.Name == r.Drug1)?.Id, out var d1) ? d1 : 0,
                Drug1Name = r.Drug1,
                Drug1IsFromHistory = !newIds.Contains(allDrugs.FirstOrDefault(d => d.Name == r.Drug1)?.Id ?? ""),

                Drug2Id = int.TryParse(allDrugs.FirstOrDefault(d => d.Name == r.Drug2)?.Id, out var d2) ? d2 : 0,
                Drug2Name = r.Drug2,
                Drug2IsFromHistory = !newIds.Contains(allDrugs.FirstOrDefault(d => d.Name == r.Drug2)?.Id ?? ""),

                Probability = r.Probability ?? 0,
                Interacts = r.Interaction ?? false,
                Confidence = r.Confidence,
            }).ToList();

        return new OrderDrugInteractionResponseDto
        {
            TotalDrugsChecked = allDrugs.Count,
            TotalPairsChecked = mlResponse.Total,
            InteractionsFound = interactions.Count,
            Interactions = interactions,
        };
    }

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

        var batchRequest = new { pairs };
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
            .Select(r => new DrugInteractionResultDto
            {
                Drug1Name = r.Drug1,
                Drug1IsFromHistory = false,
                Drug2Name = r.Drug2,
                Drug2IsFromHistory = false,
                Probability = r.Probability ?? 0,
                Interacts = r.Interaction ?? false,
                Confidence = r.Confidence,
            }).ToList();

        return new OrderDrugInteractionResponseDto
        {
            TotalDrugsChecked = drugs.Count,
            TotalPairsChecked = mlResponse.Total,
            InteractionsFound = interactions.Count,
            Interactions = interactions,
        };
    }

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