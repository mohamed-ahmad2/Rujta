using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.DTOs
{
     public class PrescriptionResultDto
    {
        public List<MedicineDto> AvailableMedicines { get; set; } = new();
        public List<string> NotFoundMedicines { get; set; } = new();
    }
}
