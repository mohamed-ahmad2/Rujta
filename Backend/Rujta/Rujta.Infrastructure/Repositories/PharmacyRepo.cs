using Rujta.Application.Interfaces;
using Rujta.Domain.Entities;
using Rujta.Infrastructure.Data;
using System.Collections.Generic;
using System.Linq;

namespace Rujta.Infrastructure.Repositories
{
    public class PharmacyRepo : IPharmacyRepository
    {
        private readonly AppDbContext _context;

        public PharmacyRepo(AppDbContext context)
        {
            _context = context;
        }

        public IEnumerable<Pharmacy> GetAllPharmacies()
        {
            return _context.Pharmacies.ToList();
        }
    }
}
