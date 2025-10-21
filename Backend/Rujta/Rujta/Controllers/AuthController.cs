using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Rujta.Infrastructure.Identity;


namespace Rujta.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly UserManager<ApplicationUser> _userManager;

        public AuthController(SignInManager<ApplicationUser> signInManager, UserManager<ApplicationUser> userManager)
        {
            _signInManager = signInManager;
            _userManager = userManager;
        }

        //[HttpPost("register")]
        //public async Task<IActionResult> Register([FromBody])
        //{
        //    return Ok(ModelState);
        //}
    }
}
