using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.DTOs
{
    public class StaffPerformanceDto
    {
        public Guid StaffId { get; set; }
        public string StaffName { get; set; } = string.Empty;
        public int OrdersHandled { get; set; }
        public decimal TotalSales { get; set; }
        public decimal AvgOrderValue { get; set; }
    }

}
