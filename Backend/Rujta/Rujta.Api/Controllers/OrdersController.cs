using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Rujta.Application.DTOs;
using Rujta.Domain.Entities;
using Rujta.Domain.Enums;
using Rujta.Infrastructure.Data; 

namespace Rujta.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OrdersController(AppDbContext context)
        {
            _context = context;
        }

       
    }
}
