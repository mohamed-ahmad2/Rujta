namespace Rujta.Infrastructure.Repositories
{
    public class PharmacyRepo : GenericRepository<Pharmacy>, IPharmacyRepository
    {
        

        public PharmacyRepo(AppDbContext context) : base(context) { }
        

        public async Task<IEnumerable<Pharmacy>> GetAllPharmacies(CancellationToken cancellationToken = default) =>
             await _context.Pharmacies.ToListAsync(cancellationToken);
        
    }
}
