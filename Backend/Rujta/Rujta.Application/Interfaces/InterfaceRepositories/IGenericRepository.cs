using System.Linq.Expressions;

namespace Rujta.Application.Interfaces
{
    public interface IGenericRepository<T, TKey> where T : class
    {
        Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default);

        Task<T?> GetByIdAsync(TKey id, CancellationToken cancellationToken = default);

        Task AddAsync(T entity, CancellationToken cancellationToken = default);

        Task UpdateAsync(T entity, CancellationToken cancellationToken = default);

        Task DeleteAsync(T entity, CancellationToken cancellationToken = default);

        Task<IEnumerable<T>> FindAsync(
            Expression<Func<T, bool>> predicate,
            CancellationToken cancellationToken = default,
            Func<IQueryable<T>, IQueryable<T>>? include = null
        );

        IQueryable<T> GetQueryable();

        Task<bool> AnyAsync(Expression<Func<T, bool>> predicate,CancellationToken cancellationToken = default);

        Task<IEnumerable<T>> GetAllWithIncludesAsync(CancellationToken cancellationToken = default,params Expression<Func<T, object>>[] includes);

        Task<T?> GetByIdWithIncludesAsync( TKey id, CancellationToken cancellationToken = default, params Expression<Func<T, object>>[] includes);
        Task SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}