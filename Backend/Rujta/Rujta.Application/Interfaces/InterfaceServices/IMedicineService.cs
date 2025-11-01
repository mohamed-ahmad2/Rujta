using Rujta.Application.DTOs;
using Rujta.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.Interfaces.InterfaceServices
{
    public interface IMedicineService
    {
        Task<IEnumerable<MedicineDto>> GetAllAsync();
        Task<MedicineDto?> GetByIdAsync(int id);
        Task AddAsync(MedicineDto dto);
        Task UpdateAsync(int id, MedicineDto dto);
        Task DeleteAsync(int id);
        Task<IEnumerable<MedicineDto>> SearchAsync(string query, int top = 10);
    }

}
