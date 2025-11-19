using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.DTOs
{
    public class DailySalesDto
    {
        public string DateLabel { get; set; } = string.Empty; // مثلاً "2025-11-18" أو "Nov 18"
        public decimal TotalSales { get; set; }
        public int OrdersCount { get; set; }
        public decimal Profit { get; set; }   // لو بتحسب profit من تكلفة الشراء

    }
}

