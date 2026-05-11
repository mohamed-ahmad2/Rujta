using System.Linq.Expressions;

namespace Rujta.Infrastructure.Repositories
{
    public class GenericRepository<T, TKey> : IGenericRepository<T, TKey>
        where T : class
    {
        protected readonly AppDbContext _context;
        protected readonly DbSet<T> _dbSet;

        public GenericRepository(AppDbContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }

        public virtual async Task<IEnumerable<T>> GetAllAsync(
            CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .AsNoTracking()
                .ToListAsync(cancellationToken);
        }

        public virtual async Task<T?> GetByIdAsync(
            TKey id,
            CancellationToken cancellationToken = default)
        {
            return await _dbSet.FindAsync(new object[] { id! }, cancellationToken);
        }

        public virtual async Task AddAsync(
            T entity,
            CancellationToken cancellationToken = default)
        {
            await _dbSet.AddAsync(entity, cancellationToken);
        }

        public virtual Task UpdateAsync(T entity,CancellationToken cancellationToken = default)
        {
            _dbSet.Update(entity);
            return Task.CompletedTask;
        }

        public virtual Task DeleteAsync(
            T entity,
            CancellationToken cancellationToken = default)
        {
            _dbSet.Remove(entity);
            return Task.CompletedTask;
        }

        public virtual async Task<IEnumerable<T>> FindAsync(
            Expression<Func<T, bool>> predicate,
            CancellationToken cancellationToken = default,
            Func<IQueryable<T>, IQueryable<T>>? include = null)
        {
            IQueryable<T> query = _dbSet
                .AsNoTracking()
                .Where(predicate);

            if (include != null)
                query = include(query);

            return await query.ToListAsync(cancellationToken);
        }

        public IQueryable<T> GetQueryable()
            => _dbSet.AsNoTracking();
        

        public virtual async Task<bool> AnyAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
            => await _dbSet.AnyAsync(predicate, cancellationToken);

        public virtual async Task<IEnumerable<T>> GetAllWithIncludesAsync( CancellationToken cancellationToken = default, params Expression<Func<T, object>>[] includes)
        {
            IQueryable<T> query = _dbSet.AsNoTracking();

            if (includes != null)
                foreach (var inc in includes)
                    query = query.Include(inc);

            return await query.ToListAsync(cancellationToken);
        }

        public virtual async Task<T?> GetByIdWithIncludesAsync(TKey id,CancellationToken cancellationToken = default,params Expression<Func<T, object>>[] includes)
        {
            IQueryable<T> query = _dbSet;

            if (includes != null)
                foreach (var inc in includes)
                    query = query.Include(inc);

       
            var keyName = _context.Model
                .FindEntityType(typeof(T))!
                .FindPrimaryKey()!
                .Properties
                .Select(p => p.Name)
                .First();

            return await query.FirstOrDefaultAsync( e => EF.Property<TKey>(e, keyName)!.Equals(id),cancellationToken);
        }
        
        public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            await _context.SaveChangesAsync(cancellationToken);
        }

        public virtual async Task<T?> FindOneAsync(Expression<Func<T, bool>> predicate,CancellationToken cancellationToken = default,Func<IQueryable<T>, IQueryable<T>>? include = null)
        {
            IQueryable<T> query = _dbSet
                .AsNoTracking()
                .Where(predicate);

            if (include != null)
                query = include(query);

            return await query.FirstOrDefaultAsync(cancellationToken);
        }
    }
}