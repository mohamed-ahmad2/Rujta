using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.DTOs
{
    public class LowStockItemDto
    {
        public int MedicineId { get; set; }
        public string MedicineName { get; set; } = string.Empty;
        public int CurrentStock { get; set; }
        public string? UnitName { get; set; }  // Tablet, Bottle, Strip, etc.

        public int ReorderLevel { get; set; }   // العتبة اللي تحسّب عندها الإنذار
    }
}

