namespace Rujta.Domain.Entities
{
    public enum ReceiverType
    {
        User = 1,
        Pharmacy = 2
    }

    public class Notification
    {
        public int Id { get; set; }

        // who should receive this notification
        public ReceiverType ReceiverType { get; set; }

        public string? UserId { get; set; }       // used when ReceiverType.User
        public int? PharmacyId { get; set; }      // used when ReceiverType.Pharmacy

        public string Title { get; set; } = default!;
        public string Message { get; set; } = default!;

        public string? Payload { get; set; }

        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
