namespace Rujta.Models
{
    public class Admin : Person
    {
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? LastLoginDate { get; set; }
    }
}
