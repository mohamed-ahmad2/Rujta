using Rujta.Domain.Entities;
using Rujta.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Collections.Generic;
using System.Linq;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

public interface IPharmacyRepository
{
    IEnumerable<Pharmacy> GetAllPharmacies();
}

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

