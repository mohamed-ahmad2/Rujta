// ─────────────────────────────────────────────────────────────────────────────
// FILE: Rujta.Application/DTOs/MlDtos.cs
// Matches the FastAPI /predict/batch response exactly
// ─────────────────────────────────────────────────────────────────────────────

using System.Text.Json.Serialization;

namespace Rujta.Application.DTOs;

// ── What FastAPI returns for each pair ────────────────────────────────────────
public class MlPairResultDto
{
    [JsonPropertyName("drug_1")]
    public string? Drug1 { get; set; }

    [JsonPropertyName("drug_2")]
    public string? Drug2 { get; set; }

    [JsonPropertyName("interaction")]
    public bool? Interaction { get; set; }

    [JsonPropertyName("probability")]
    public double? Probability { get; set; }

    [JsonPropertyName("confidence")]
    public string? Confidence { get; set; }

    [JsonPropertyName("label")]
    public int? Label { get; set; }

    [JsonPropertyName("error")]
    public string? Error { get; set; }

    [JsonPropertyName("index")]
    public int Index { get; set; }
}

// ── Full /predict/batch response ─────────────────────────────────────────────
public class BatchMlResponseDto
{
    [JsonPropertyName("results")]
    public List<MlPairResultDto> Results { get; set; } = new();

    [JsonPropertyName("total")]
    public int Total { get; set; }

    [JsonPropertyName("errors")]
    public int Errors { get; set; }
}

// ── What we send to the DB / ML service per drug ─────────────────────────────
