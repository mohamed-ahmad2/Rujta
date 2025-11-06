using Rujta.Application.DTOs;



namespace Rujta.Application.Interfaces.InterfaceServices
{
    public interface IMedicineService : IGenericService<MedicineDto>
    {
        Task<IEnumerable<MedicineDto>> SearchAsync(string query, int top = 10, CancellationToken cancellationToken = default);
    }

}
