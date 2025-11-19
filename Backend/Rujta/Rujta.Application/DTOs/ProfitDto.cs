using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.DTOs
{
    public class ProfitSummaryDto
    {
        public decimal TotalProfit { get; set; }
        public decimal ProfitMargin { get; set; } // percentage
        public List<ProfitProductDto> Products { get; set; } = new();
    }

    public class ProfitProductDto
    {
        public int MedicineId { get; set; }
        public string MedicineName { get; set; } = string.Empty;
        public decimal CostPrice { get; set; }
        public decimal SellPrice { get; set; }
        public decimal Profit { get; set; }
    }

}
