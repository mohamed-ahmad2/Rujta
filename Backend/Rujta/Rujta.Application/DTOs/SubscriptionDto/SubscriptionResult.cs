using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.DTOs.SubscriptionDto
{
    public class SubscriptionResult
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        public static SubscriptionResult Ok(DateTime start, DateTime end) =>
            new() { Success = true, StartDate = start, EndDate = end };

        public static SubscriptionResult Fail(string message) =>
            new() { Success = false, Message = message };
    }
}
