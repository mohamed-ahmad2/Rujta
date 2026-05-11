using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.DTOs
{

    public class DrugInteractionResultDto
    {
        public int Drug1Id { get; set; }
        public string? Drug1Name { get; set; }
        public bool Drug1IsFromHistory { get; set; }  // ← NEW

        public int Drug2Id { get; set; }
        public string? Drug2Name { get; set; }
        public bool Drug2IsFromHistory { get; set; }  // ← NEW

        public double Probability { get; set; }
        public bool Interacts { get; set; }
        public string? Confidence { get; set; }    // ← NEW (high/medium/low)
    }

    /// <summary>
    /// Full response returned to frontend after checking a new order.
    /// </summary>
    public class OrderDrugInteractionResponseDto
    {
        public int TotalDrugsChecked { get; set; }
        public int TotalPairsChecked { get; set; }
        public int InteractionsFound { get; set; }
        public bool MlServiceUnavailable { get; set; }
        public List<DrugInteractionResultDto> Interactions { get; set; } = new();
    }

    /// <summary>
    /// Internal model passed to the ML service HTTP call.
    /// Mirrors the Python FastAPI PredictRequest schema.
    /// </summary>
    public class MlDrugInputDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Smiles { get; set; } = string.Empty;
    }

    internal class MlPredictRequestDto
    {
        public List<MlDrugInputDto> Drugs { get; set; } = new();
        public double Threshold { get; set; } = 0.5;
    }

    internal class MlInteractionResultDto
    {
        public string Drug1Id { get; set; } = string.Empty;
        public string Drug1Name { get; set; } = string.Empty;
        public string Drug2Id { get; set; } = string.Empty;
        public string Drug2Name { get; set; } = string.Empty;
        public double Probability { get; set; }
        public bool Interacts { get; set; }
    }

    internal class MlPredictResponseDto
    {
        public int TotalDrugs { get; set; }
        public int TotalPairsChecked { get; set; }
        public int InteractionsFound { get; set; }
        public List<MlInteractionResultDto> Interactions { get; set; } = new();
    }
}
