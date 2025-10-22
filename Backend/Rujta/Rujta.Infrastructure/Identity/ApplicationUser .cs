using Microsoft.AspNetCore.Identity;
using Rujta.Domain.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Infrastructure.Identity
{
    public class ApplicationUser : IdentityUser<Guid>
    {
        public Guid DomainPersonId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;

        [ForeignKey("DomainPersonId")]
        public required virtual Person DomainPerson { get; set; }
    }
}
