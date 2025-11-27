using AutoMapper;
using Rujta.Application.DTOs;
using Rujta.Application.Interfaces;
using Rujta.Application.Interfaces.InterfaceServices;
using Rujta.Domain.Entities;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Rujta.Infrastructure.Services
{
    public class StaffService : IGenericService<StaffDto>
    {
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;

        public StaffService(IUnitOfWork uow, IMapper mapper)
        {
            _uow = uow;
            _mapper = mapper;
        }

        public async Task<IEnumerable<StaffDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var entities = await _uow.Staffs.GetAllAsync(cancellationToken);
            return _mapper.Map<IEnumerable<StaffDto>>(entities);
        }

        public async Task<StaffDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var entity = await _uow.Staffs.GetByIdAsync(id, cancellationToken);
            return _mapper.Map<StaffDto>(entity);
        }

        public async Task AddAsync(StaffDto dto, CancellationToken cancellationToken = default)
        {
            var entity = _mapper.Map<Staff>(dto);
            await _uow.Staffs.AddAsync(entity, cancellationToken);
            await _uow.SaveAsync(cancellationToken);
        }

        public async Task UpdateAsync(int id, StaffDto dto, CancellationToken cancellationToken = default)
        {
            var entity = await _uow.Staffs.GetByIdAsync(id, cancellationToken);
            if (entity == null)
                return;

            _mapper.Map(dto, entity);
            await _uow.Staffs.UpdateAsync(entity, cancellationToken);
            await _uow.SaveAsync(cancellationToken);
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var entity = await _uow.Staffs.GetByIdAsync(id, cancellationToken);
            if (entity == null)
                return;

            await _uow.Staffs.DeleteAsync(entity, cancellationToken);
            await _uow.SaveAsync(cancellationToken);
        }
        // Get staff by manager
        public async Task<IEnumerable<StaffDto>> GetStaffByManagerAsync(Guid managerId, CancellationToken cancellationToken = default)
        {
            var staffEntities = await _uow.Staffs.FindAsync(s => s.ManagerID == managerId, cancellationToken);
            return _mapper.Map<IEnumerable<StaffDto>>(staffEntities);
        }
    }
}
