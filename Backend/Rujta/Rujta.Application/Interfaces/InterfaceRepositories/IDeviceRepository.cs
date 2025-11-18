using Rujta.Domain.Entities;

namespace Rujta.Application.Interfaces.InterfaceRepositories
{
    public interface IDeviceRepository : IGenericRepository<Device>
    {
        Task<Device?> GetByDeviceIdAsync(string deviceId);
    }
}
