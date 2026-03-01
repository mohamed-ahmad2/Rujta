using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.DTOs
{
    // CustomerDto.cs
    public class CustomerDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;

        public int OrdersPlaced { get; set; }
        public decimal TotalSpend { get; set; }
        public string LastOrderDate { get; set; } = string.Empty; // for frontend display
    }

    // CreateCustomerDto.cs
    public class CreateCustomerDto
    {
        public string Name { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int PharmacyId { get; set; }
    }

    // UpdateCustomerDto.cs
    public class UpdateCustomerDto
    {
        public string Name { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }


    // Customer stats
    public class CustomerStatsDto
    {
        public int TotalCustomers { get; set; }
        public int NewCustomers { get; set; }
        public int ReturningCustomers { get; set; }
    }
}
