using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

// ─────────────────────────────────────────────────────────────────────────────
// FILE: Rujta.Application/Services/DrugInteractionService.cs
// ─────────────────────────────────────────────────────────────────────────────

using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Rujta.Application.DTOs;
using Rujta.Application.Interfaces.InterfaceServices;
using Rujta.Domain.Entities;

// ─────────────────────────────────────────────────────────────────────────────
// FILE: Rujta.Application/Services/DrugInteractionService.cs
//
// Now lives in Application cleanly — no AppDbContext reference.
// DB access is fully delegated to IDrugHistoryRepository.
// ─────────────────────────────────────────────────────────────────────────────

using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Rujta.Application.DTOs;
using Rujta.Application.Interfaces;
using Rujta.Application.Interfaces.InterfaceServices;

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
        // ── Step 1: Load medicines from the new order ─────────────────────────
        var newMedicines = await _drugHistoryRepo
            .GetMedicinesByIdsAsync(newOrderMedicineIds, ct);

        // ── Step 2: Load patient's historical medicines ───────────────────────
        var historicalMedicines = await _drugHistoryRepo
            .GetPatientDrugHistoryAsync(patientUserId, ct);

        // ── Step 3: Merge and deduplicate ─────────────────────────────────────
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

        // ── Step 4: Call Python ML service ────────────────────────────────────
        var mlRequest = new MlPredictRequestDto { Drugs = allDrugs, Threshold = threshold };
        MlPredictResponseDto? mlResponse = null;
        bool mlUnavailable = false;

        try
        {
            var httpResponse = await _http.PostAsJsonAsync(
                "/predict", mlRequest, _jsonOptions, ct);

            httpResponse.EnsureSuccessStatusCode();

            mlResponse = await httpResponse.Content
                .ReadFromJsonAsync<MlPredictResponseDto>(_jsonOptions, ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex,
                "ML service unavailable — order will proceed without interaction check");
            mlUnavailable = true;
        }

        if (mlUnavailable || mlResponse is null)
        {
            return new OrderDrugInteractionResponseDto
            {
                TotalDrugsChecked = allDrugs.Count,
                MlServiceUnavailable = true,
                Interactions = new List<DrugInteractionResultDto>()
            };
        }

        // ── Step 5: Map to frontend DTOs ──────────────────────────────────────
        var interactions = mlResponse.Interactions.Select(i => new DrugInteractionResultDto
        {
            Drug1Id = int.TryParse(i.Drug1Id, out var d1) ? d1 : 0,
            Drug1Name = i.Drug1Name,
            Drug2Id = int.TryParse(i.Drug2Id, out var d2) ? d2 : 0,
            Drug2Name = i.Drug2Name,
            Probability = i.Probability,
            Interacts = i.Interacts,
        }).ToList();

        return new OrderDrugInteractionResponseDto
        {
            TotalDrugsChecked = allDrugs.Count,
            TotalPairsChecked = mlResponse.TotalPairsChecked,
            InteractionsFound = mlResponse.InteractionsFound,
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