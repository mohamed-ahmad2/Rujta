using Microsoft.EntityFrameworkCore;
using Rujta.Application.Interfaces.InterfaceRepositories;
using Rujta.Domain.Entities;
using Rujta.Infrastructure.Data;
using System.Linq;

namespace Rujta.Infrastructure.Repositories
{
    public class LogRepository : GenericRepository<Log>, ILogRepository
    {
        private readonly AppDbContext _context;

        public LogRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public IQueryable<Log> Query()
        {
            return _context.Logs.AsQueryable();
        }
    }
}


