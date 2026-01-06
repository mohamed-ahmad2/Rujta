using Rujta.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Domain.Entities
{
    public class Customer : Person
    {
        public int PharmacyId { get; set; }
        public Pharmacy Pharmacy { get; set; } = null!;
    }


}
