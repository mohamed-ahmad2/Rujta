namespace Rujta.Infrastructure.Repositories
{
    public class DeviceRepository : GenericRepository<Device>, IDeviceRepository
    {
        public DeviceRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<Device?> GetByDeviceIdAsync(string deviceId) =>
             await _context.Devices
                .FirstOrDefaultAsync(d => d.DeviceId == deviceId);
        

    }
}
