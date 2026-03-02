namespace Rujta.Application.Interfaces.InterfaceServices.IGenericS
{
    public interface IGenericService<TDto,TKey>
    {
        Task<IEnumerable<TDto>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<TDto?> GetByIdAsync(TKey id, CancellationToken cancellationToken = default);
        Task AddAsync(TDto dto, CancellationToken cancellationToken = default);
        Task UpdateAsync(TKey id, TDto dto, CancellationToken cancellationToken = default);
        Task DeleteAsync(TKey id, CancellationToken cancellationToken = default);
    }
}
