using AutoMapper;
using Rujta.Application.DTOs;
using Rujta.Application.Interfaces;
using Rujta.Application.Interfaces.InterfaceServices;
using Rujta.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Rujta.Application.Services
{
    public class StaffManagementService : IStaffManagementService
    {
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;

        public StaffManagementService(IUnitOfWork uow, IMapper mapper)
        {
            _uow = uow;
            _mapper = mapper;
        }

        // Get all staff as DTOs
        public async Task<IEnumerable<StaffDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var staffEntities = await _uow.Staffs.GetAllAsync(cancellationToken);
            return _mapper.Map<IEnumerable<StaffDto>>(staffEntities);
        }

        // Get staff by ID
        public async Task<StaffDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var staff = await _uow.Staffs.GetByIdAsync(id, cancellationToken);
            return staff == null ? null : _mapper.Map<StaffDto>(staff);
        }

        // Add new staff
        public async Task AddAsync(StaffDto dto, CancellationToken cancellationToken = default)
        {
            var staffEntity = _mapper.Map<Staff>(dto);
            await _uow.Staffs.AddAsync(staffEntity, cancellationToken);
            await _uow.SaveAsync(cancellationToken);
        }

        // Update existing staff
        public async Task UpdateAsync(int id, StaffDto dto, CancellationToken cancellationToken = default)
        {
            var existing = await _uow.Staffs.GetByIdAsync(id, cancellationToken);
            if (existing == null) throw new KeyNotFoundException("Staff not found.");

            // Map updated fields from DTO
            _mapper.Map(dto, existing);

            await _uow.Staffs.UpdateAsync(existing, cancellationToken);
            await _uow.SaveAsync(cancellationToken);
        }

        // Delete staff
        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var existing = await _uow.Staffs.GetByIdAsync(id, cancellationToken);
            if (existing == null) throw new KeyNotFoundException("Staff not found.");

            await _uow.Staffs.DeleteAsync(existing, cancellationToken);
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
