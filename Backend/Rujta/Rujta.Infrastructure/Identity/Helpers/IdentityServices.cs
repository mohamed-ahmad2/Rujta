using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Infrastructure.Identity.Helpers
{
    public class IdentityServices
    {
        public UserManager<ApplicationUser> UserManager { get; }
        public SignInManager<ApplicationUser> SignInManager { get; }

        public IdentityServices(UserManager<ApplicationUser> userManager,
                                SignInManager<ApplicationUser> signInManager)
        {
            UserManager = userManager;
            SignInManager = signInManager;
        }
    }
}
