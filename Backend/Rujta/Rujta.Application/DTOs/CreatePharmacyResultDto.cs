using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.DTOs
{
    public class CreatePharmacyResultDto
    {
        public int PharmacyId { get; set; }
        public string AdminEmail { get; set; } = string.Empty;
        public string GeneratedPassword { get; set; } = string.Empty;
    }


}
