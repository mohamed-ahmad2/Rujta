using Rujta.Domain.Common;

namespace Rujta.Domain.Entities
{
    public enum ReceiverType
    {
        User = 1,
        Pharmacy = 2
    }

    public class Notification : BaseEntity
    {
        public ReceiverType ReceiverType { get; set; }

        public string? UserId { get; set; }
        public int? PharmacyId { get; set; }

        public string Title { get; set; } = default!;
        public string Message { get; set; } = default!;

        public string? Payload { get; set; }

        public bool IsRead { get; set; } = false;
    }
}
