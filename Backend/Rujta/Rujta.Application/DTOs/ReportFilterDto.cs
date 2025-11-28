using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.DTOs
{
    public class ReportFilterDto
    {
        public int PharmacyId { get; set; }
        public DateTime From { get; set; } = DateTime.UtcNow.Date.AddDays(-30);
        public DateTime To { get; set; } = DateTime.UtcNow;
        public int TopNProducts { get; set; } = 5;
        public int LowStockThreshold { get; set; } = 10;
        public bool IncludeExpiredItems { get; set; } = true;
        public bool IncludeLowStock { get; set; } = true;

    }
}

