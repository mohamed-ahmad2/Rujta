using Rujta.Application.DTOs;

namespace Rujta.Application.Interfaces.InterfaceServices.IMedicine
{
    public interface ISearchMedicineService
    {
        Task<IEnumerable<MedicineDto>> SearchAsync(string query, Guid userId, int top = 10, CancellationToken cancellationToken = default);
    }
}
