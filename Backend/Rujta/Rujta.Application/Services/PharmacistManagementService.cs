using AutoMapper;
using Rujta.Application.DTOs;
using Rujta.Application.Interfaces;
using Rujta.Application.Interfaces.InterfaceServices;
using Rujta.Domain.Common;
using Rujta.Domain.Entities;


namespace Rujta.Infrastructure.Services
{
    public class PharmacistManagementService : IPharmacistManagementService
    {
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;
        private readonly ILogService _logService;


        public PharmacistManagementService(IUnitOfWork uow, IMapper mapper , ILogService logService)
        {
            _uow = uow;
            _mapper = mapper;
            _logService = logService;
        }

        public async Task<IEnumerable<PharmacistDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var entities = await _uow.Pharmacists.GetAllAsync(cancellationToken);
            return _mapper.Map<IEnumerable<PharmacistDto>>(entities);
        }

        public async Task<PharmacistDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var entity = await _uow.Pharmacists.GetByIdAsync(id, cancellationToken);
            return _mapper.Map<PharmacistDto>(entity);
        }

        public async Task AddAsync(PharmacistDto dto, CancellationToken cancellationToken = default)
        {
            var entity = _mapper.Map<Pharmacist>(dto);

            await _uow.Pharmacists.AddAsync(entity, cancellationToken);
            await _uow.SaveAsync(cancellationToken);

            await _logService.AddLogAsync(
                user: dto.Email ?? "System",
                action: $"Pharmacist Added (Name: {dto.FullName})",
                cancellationToken
            );
        }


        public async Task UpdateAsync(int id, PharmacistDto dto, CancellationToken cancellationToken = default)
        {
            var entity = await _uow.Pharmacists.GetByIdAsync(id, cancellationToken);
            if (entity == null)
                return;

            _mapper.Map(dto, entity);
            await _uow.Pharmacists.UpdateAsync(entity, cancellationToken);
            await _uow.SaveAsync(cancellationToken);

            await _logService.AddLogAsync(
                user: dto.Email ?? "System",
                action: $"Pharmacist Updated (ID: {id})",
                cancellationToken
            );
        }


        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var entity = await _uow.Pharmacists.GetByIdAsync(id, cancellationToken);
            if (entity == null)
                return;

            await _uow.Pharmacists.DeleteAsync(entity, cancellationToken);
            await _uow.SaveAsync(cancellationToken);

            await _logService.AddLogAsync(
                user: "System",
                action: $"Pharmacist Deleted (ID: {id})",
                cancellationToken
            );
        }

        // Get staff by manager
        public async Task<IEnumerable<PharmacistDto>> GetPharmacistByManagerAsync(Guid managerId, CancellationToken cancellationToken = default)
        {
            var staffEntities = await _uow.Pharmacists.FindAsync(s => s.ManagerId == managerId, cancellationToken);
            return _mapper.Map<IEnumerable<PharmacistDto>>(staffEntities);
        }
    }
}
