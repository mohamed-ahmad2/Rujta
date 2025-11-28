using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.DTOs
{
    public class ForgotPasswordResponseDto
    {
        public string Message { get; set; }
        public string Otp { get; set; }
    }
}
