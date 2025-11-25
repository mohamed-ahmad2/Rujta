using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.DTOs
{
    public class InventorySummaryDto
    {
        public int TotalItems { get; set; }        // عدد أنواع الأدوية في المخزون
        public int LowStockCount { get; set; }
        public int OutOfStockCount { get; set; }
        public decimal InventoryTotalValue { get; set; }

    }
}

