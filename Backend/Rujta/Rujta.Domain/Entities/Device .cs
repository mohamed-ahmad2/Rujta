using Rujta.Domain.Common;

namespace Rujta.Domain.Entities
{
    public class Device : BaseEntity
    {
        public string DeviceId { get; set; } = string.Empty;
        public Guid UserId { get; set; }
        public string? DeviceName { get; set; }
        public string? IPAddress { get; set; }
        public DateTime? LastUsedAt { get; set; }
    }
}
