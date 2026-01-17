namespace Rujta.Infrastructure.Services
{
    public class LogService : ILogService
    {
        private readonly IUnitOfWork _uow;

        public LogService(IUnitOfWork uow)
        {
            _uow = uow;
        }

        #region Generic CRUD (from IGenericService<LogDto>)

        public async Task<IEnumerable<LogDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var logs = _uow.Logs.Query()
                .OrderByDescending(l => l.Timestamp)
                .Select(l => new LogDto
                {
                    Id = l.Id,
                    User = l.User,
                    Action = l.Action,
                    Timestamp = l.Timestamp
                })
                .ToList();

            return await Task.FromResult(logs);
        }

        public async Task<LogDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var log = _uow.Logs.Query().FirstOrDefault(l => l.Id == id);
            if (log == null) return null;

            return await Task.FromResult(new LogDto
            {
                Id = log.Id,
                User = log.User,
                Action = log.Action,
                Timestamp = log.Timestamp
            });
        }

        public async Task AddAsync(LogDto dto, CancellationToken cancellationToken = default)
        {
            var log = new Log
            {
                User = dto.User,
                Action = dto.Action,
                Timestamp = dto.Timestamp
            };

            await _uow.Logs.AddAsync(log, cancellationToken);
            await _uow.SaveAsync(cancellationToken);
        }

        public async Task UpdateAsync(int id, LogDto dto, CancellationToken cancellationToken = default)
        {
            var log = _uow.Logs.Query().FirstOrDefault(l => l.Id == id);
            if (log == null) return;

            log.User = dto.User;
            log.Action = dto.Action;
            log.Timestamp = dto.Timestamp;

            await _uow.SaveAsync(cancellationToken);
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var log = _uow.Logs.Query().FirstOrDefault(l => l.Id == id);
            if (log == null) return;

            await _uow.Logs.DeleteAsync(log, cancellationToken);
            await _uow.SaveAsync(cancellationToken);
        }

        #endregion

        #region Log-specific methods

        public async Task AddLogAsync(string user, string action, CancellationToken cancellationToken = default)
        {
            var log = new Log
            {
                User = user,
                Action = action,
                Timestamp = DateTime.UtcNow
            };

            await _uow.Logs.AddAsync(log, cancellationToken);
            await _uow.SaveAsync(cancellationToken);
        }

        public async Task<IEnumerable<LogDto>> GetPagedAsync(int page = 1, int pageSize = 50, CancellationToken cancellationToken = default)
        {
            var logs = _uow.Logs.Query()
                .OrderByDescending(l => l.Timestamp)
                .Select(l => new LogDto
                {
                    Id = l.Id,
                    User = l.User,
                    Action = l.Action,
                    Timestamp = l.Timestamp
                })
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return await Task.FromResult(logs);
        }

        #endregion
    }

}
