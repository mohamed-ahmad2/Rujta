using Rujta.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.Interfaces.InterfaceRepositories
{
    public interface IMedicineRepository : IGenericRepository<Medicine>
    {
 
        Task<IEnumerable<Medicine>> GetExpiredMedicinesAsync();
        Task<IEnumerable<Medicine>> GetExpiringSoonMedicinesAsync(int days = 30);
    }
}
