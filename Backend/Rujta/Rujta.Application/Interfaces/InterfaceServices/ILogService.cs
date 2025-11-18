using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Rujta.Application.DTOs;


namespace Rujta.Application.Interfaces.InterfaceServices
{
    public interface ILogService : IGenericService<LogDto>
    {
        Task AddLogAsync(string user, string action, CancellationToken cancellationToken = default);
        Task<IEnumerable<LogDto>> GetPagedAsync(int page = 1, int pageSize = 50, CancellationToken cancellationToken = default);
    }

}

