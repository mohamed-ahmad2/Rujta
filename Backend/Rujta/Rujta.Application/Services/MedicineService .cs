using AutoMapper;
using F23.StringSimilarity;
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

       
        public async Task<IEnumerable<MedicineDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var medicines = await _unitOfWork.Medicines.GetAllAsync(cancellationToken);
            return _mapper.Map<IEnumerable<MedicineDto>>(medicines);
        }

        
        public async Task<MedicineDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var medicine = await _unitOfWork.Medicines.GetByIdAsync(id, cancellationToken);
            return _mapper.Map<MedicineDto?>(medicine);
        }

        
        public async Task AddAsync(MedicineDto dto, CancellationToken cancellationToken = default)
        {
            var medicine = _mapper.Map<Medicine>(dto);
            await _unitOfWork.Medicines.AddAsync(medicine, cancellationToken);
            await _unitOfWork.SaveAsync();
        }

       
        public async Task UpdateAsync(int id, MedicineDto dto, CancellationToken cancellationToken = default)
        {
            var medicine = await _unitOfWork.Medicines.GetByIdAsync(id, cancellationToken);
            if (medicine == null) return;

            _mapper.Map(dto, medicine);
            await _unitOfWork.Medicines.UpdateAsync(medicine, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);
        }

        
        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var medicine = await _unitOfWork.Medicines.GetByIdAsync(id, cancellationToken);
            if (medicine == null) return;

            await _unitOfWork.Medicines.DeleteAsync(medicine, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);
        }

        

    }
}
