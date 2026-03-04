using Rujta.Application.DTOs;
using Rujta.Application.Interfaces.InterfaceServices.IGenericS;



namespace Rujta.Application.Interfaces.InterfaceServices.IMedicine
{
    public interface IMedicineService : IGenericService<MedicineDto, int>
    {
        Task<IEnumerable<MedicineDto>> GetFilteredAsync(MedicineFilterDto filter, CancellationToken cancellationToken = default);
    }
}
