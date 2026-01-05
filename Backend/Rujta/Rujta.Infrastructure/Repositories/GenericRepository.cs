using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Rujta.Infrastructure.Repositories
{
    public class GenericRepository<T> : IGenericRepository<T> where T : class
    {
        protected readonly AppDbContext _context;
        protected readonly DbSet<T> _dbSet;

        public GenericRepository(AppDbContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }

        public virtual async Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default) =>
            await _dbSet
            .AsNoTracking()
            .ToListAsync(cancellationToken);



        public virtual async Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken = default)=>
            await _dbSet.FindAsync(new object[] { id }, cancellationToken);
        

        public virtual async Task AddAsync(T entity, CancellationToken cancellationToken = default)=>
            await _dbSet.AddAsync(entity, cancellationToken);
        

        public virtual Task UpdateAsync(T entity, CancellationToken cancellationToken = default)
        {
            _dbSet.Update(entity);
            return Task.CompletedTask;
        }

        public virtual Task DeleteAsync(T entity, CancellationToken cancellationToken = default)
        {
            _dbSet.Remove(entity);
            return Task.CompletedTask;
        }
        public virtual async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default) =>
                await _dbSet
                .AsNoTracking()
                .Where(predicate)
                .ToListAsync(cancellationToken);



        public IQueryable<T> GetQueryable() =>
            _dbSet.AsNoTracking();
    }
}