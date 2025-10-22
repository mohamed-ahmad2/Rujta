using Rujta.Application.Interfaces;
using Rujta.Domain.Entities;
using Rujta.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Collections.Generic;
using System.Linq;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace Rujta.Infrastructure.Repositories
{
    public class PharmacyRepository : IPharmacyRepository
    {
        private readonly AppDbContext _context;

        public PharmacyRepository(AppDbContext context)
        {
            _context = context;
        }

        public IEnumerable<Pharmacy> GetAllPharmacies()
        {
            return _context.Pharmacies.ToList();
        }
    }

}