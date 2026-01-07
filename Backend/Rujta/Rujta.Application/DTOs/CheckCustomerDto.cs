using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.DTOs
{
    public class CheckCustomerRequest
    {
        public int PharmacyId { get; set; }
        public string PhoneNumber { get; set; } = string.Empty;
    }

    public class CheckCustomerResponse
    {
        public bool Exists { get; set; }
        public Guid? CustomerId { get; set; }
        public string? FullName { get; set; }
    }
}

