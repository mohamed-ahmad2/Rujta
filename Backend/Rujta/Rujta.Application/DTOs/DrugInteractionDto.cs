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
        public string Drug1Name { get; set; } = string.Empty;
        public int Drug2Id { get; set; }
        public string Drug2Name { get; set; } = string.Empty;

        /// <summary>Probability of interaction (0.0 – 1.0)</summary>
        public double Probability { get; set; }

        /// <summary>True if probability >= threshold (default 0.5)</summary>
        public bool Interacts { get; set; }

        /// <summary>Human-readable risk level derived from probability</summary>
        public string RiskLevel => Probability switch
        {
            >= 0.85 => "High",
            >= 0.65 => "Medium",
            _ => "Low"
        };
    }

    /// <summary>
    /// Full response returned to frontend after checking a new order.
    /// </summary>
    public class OrderDrugInteractionResponseDto
    {
        /// <summary>Total drugs checked (new order + patient history)</summary>
        public int TotalDrugsChecked { get; set; }

        /// <summary>Total unique pairs evaluated</summary>
        public int TotalPairsChecked { get; set; }

        /// <summary>Number of interactions found</summary>
        public int InteractionsFound { get; set; }

        /// <summary>
        /// True if ML service was unavailable — order was allowed through
        /// but frontend should show a warning.
        /// </summary>
        public bool MlServiceUnavailable { get; set; }

        /// <summary>
        /// List of drug pairs with interactions, sorted by probability desc.
        /// Empty list = no interactions detected.
        /// </summary>
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
