using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.DTOs
{
    public class RegisterDto
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string CreatePassword { get; set; } = string.Empty;
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}
