using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.DTOs.MedicineDtos
{
    public class MedicineStockDto
    {
        public int PharmacyId { get; set; }
        public int MedicineId { get; set; }
        public int Stock { get; set; }
    }
}
