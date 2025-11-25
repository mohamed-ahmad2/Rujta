using Rujta.Domain.Common;

namespace Rujta.Domain.Entities
{
    public class Log : BaseEntity
    {
        public string User { get; set; } = string.Empty;      
        public string Action { get; set; } = string.Empty;    
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}

