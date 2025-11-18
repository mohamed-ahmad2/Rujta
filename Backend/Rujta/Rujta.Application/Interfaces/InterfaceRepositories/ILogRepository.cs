using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Rujta.Domain.Entities;

namespace Rujta.Application.Interfaces.InterfaceRepositories
{
    public interface ILogRepository : IGenericRepository<Log>
    {
        IQueryable<Log> Query();  
    }
}

