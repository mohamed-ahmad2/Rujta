using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Domain.Entities
{
    public class Log
    {
        public int Id { get; set; }
        public string User { get; set; } = string.Empty;      
        public string Action { get; set; } = string.Empty;    
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
       
    }
}

