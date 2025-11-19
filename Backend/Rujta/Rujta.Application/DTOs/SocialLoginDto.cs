using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.DTOs
{
    public class SocialLoginDto
    {
        public string IdToken { get; set; }      // Google token
        public string AccessToken { get; set; }  // Facebook token
    }
}
