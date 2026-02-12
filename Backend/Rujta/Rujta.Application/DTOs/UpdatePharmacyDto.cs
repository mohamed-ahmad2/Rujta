using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.DTOs
{
    namespace Rujta.Application.DTOs
    {
        public class UpdatePharmacyDto
        {
            public string Name { get; set; } = null!;
            public string Location { get; set; } = null!;
            public string ContactNumber { get; set; } = null!;
            public double Latitude { get; set; }
            public double Longitude { get; set; }
        }

    }

}
