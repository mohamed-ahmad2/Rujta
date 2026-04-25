namespace Rujta.Application.DTOs.CustomerDtos
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

