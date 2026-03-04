using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace Rujta.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentsController(IPaymobService _paymobService) : ControllerBase
    {

        // 🔹 1️⃣ Create Payment
        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] CreatePaymentRequest request)
        {
            if (request == null || request.Amount <= 0)
                return BadRequest("Invalid amount.");

            try
            {
                var result = await _paymobService.CreatePaymentAsync(request.Amount);

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Create Payment ERROR: " + ex);
                return StatusCode(500, "Payment creation failed.");
            }
        }


        // 🔹 2️⃣ Paymob Callback (Webhook)
        [HttpPost("callback")]
        public async Task<IActionResult> Callback([FromBody] JsonElement data)
        {
            try
            {
                await _paymobService.HandleCallbackAsync(data);

                return Ok();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Callback ERROR: " + ex);
                return StatusCode(500, "Callback processing failed.");
            }
        }
    }
}