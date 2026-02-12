using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.DTOs
{
    namespace Rujta.Application.DTOs
    {
        public class PharmacyDto
        {
            public int Id { get; set; }
            public string Name { get; set; }
            public string Location { get; set; }
            public string ContactNumber { get; set; }
            public double Latitude { get; set; }
            public double Longitude { get; set; }
            public bool IsActive { get; set; }
            public Guid? AdminId { get; set; }
        }
    }

}
