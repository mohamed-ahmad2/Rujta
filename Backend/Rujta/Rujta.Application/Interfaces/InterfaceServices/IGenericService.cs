using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Rujta.Application.Interfaces.InterfaceServices
{
    public interface IGenericService<TDto>
    {
        Task<IEnumerable<TDto>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<TDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task AddAsync(TDto dto, CancellationToken cancellationToken = default);
        Task UpdateAsync(int id, TDto dto, CancellationToken cancellationToken = default);
        Task DeleteAsync(int id, CancellationToken cancellationToken = default);
    }
}
