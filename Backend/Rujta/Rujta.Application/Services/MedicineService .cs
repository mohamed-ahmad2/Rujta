using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Rujta.Application.DTOs;
using Rujta.Application.Interfaces;
using Rujta.Application.Interfaces.InterfaceServices;
using Rujta.Domain.Entities;

namespace Rujta.Application.Services
{
    public class MedicineService : IMedicineService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public MedicineService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }


        public async Task<IEnumerable<MedicineDto>> GetFilteredAsync(MedicineFilterDto filter, CancellationToken cancellationToken = default)
        {
            try
            {
                var query = _unitOfWork.Medicines
                    .GetQueryable();

                if (filter.CategoryIds != null && filter.CategoryIds.Any())
                {
                    query = query.Where(m =>
                        m.CategoryId.HasValue &&
                        filter.CategoryIds.Contains(m.CategoryId.Value));
                }

                if (!string.IsNullOrWhiteSpace(filter.ActiveIngredient))
                {
                    query = query.Where(m =>
                        m.ActiveIngredient != null &&
                        m.ActiveIngredient.Contains(filter.ActiveIngredient));
                }

                if (!string.IsNullOrWhiteSpace(filter.CompanyName))
                {
                    query = query.Where(m =>
                        m.CompanyName != null &&
                        m.CompanyName.Contains(filter.CompanyName));
                }

                var medicines = await query
                    .ToListAsync(cancellationToken);

                return _mapper.Map<IEnumerable<MedicineDto>>(medicines);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException(
                    "An error occurred while filtering medicines.",
                    ex);
            }
        }

        public async Task<IEnumerable<MedicineDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                var medicines = await _unitOfWork.Medicines.GetAllAsync(cancellationToken);
                return _mapper.Map<IEnumerable<MedicineDto>>(medicines);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("An error occurred while fetching all medicines.", ex);
            }
        }

        public async Task<MedicineDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var medicine = await _unitOfWork.Medicines.GetByIdAsync(id, cancellationToken);
            if (medicine == null)
                throw new KeyNotFoundException($"Medicine with ID={id} was not found.");

            return _mapper.Map<MedicineDto>(medicine);
        }

        public async Task AddAsync(MedicineDto dto, CancellationToken cancellationToken = default)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto), "Medicine data cannot be null.");

            try
            {
                var medicine = _mapper.Map<Medicine>(dto);
                await _unitOfWork.Medicines.AddAsync(medicine, cancellationToken);
                await _unitOfWork.SaveAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("An error occurred while adding a new medicine.", ex);
            }
        }

        public async Task UpdateAsync(int id, MedicineDto dto, CancellationToken cancellationToken = default)
        {
            var medicine = await _unitOfWork.Medicines.GetByIdAsync(id, cancellationToken);
            if (medicine == null)
                throw new KeyNotFoundException($"Medicine with ID={id} was not found.");

            try
            {
                _mapper.Map(dto, medicine);
                await _unitOfWork.Medicines.UpdateAsync(medicine, cancellationToken);
                await _unitOfWork.SaveAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"An error occurred while updating medicine ID={id}.", ex);
            }
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var medicine = await _unitOfWork.Medicines.GetByIdAsync(id, cancellationToken);
            if (medicine == null)
                throw new KeyNotFoundException($"Medicine with ID={id} was not found.");

            try
            {
                await _unitOfWork.Medicines.DeleteAsync(medicine, cancellationToken);
                await _unitOfWork.SaveAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"An error occurred while deleting medicine ID={id}.", ex);
            }
        }
    }
}
