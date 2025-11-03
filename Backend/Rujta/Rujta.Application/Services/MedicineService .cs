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
        private readonly JaroWinkler _jaro;

        public MedicineService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _jaro = new JaroWinkler();
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
            _unitOfWork.Medicines.Update(medicine, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);
        }

        
        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var medicine = await _unitOfWork.Medicines.GetByIdAsync(id, cancellationToken);
            if (medicine == null) return;

            _unitOfWork.Medicines.Delete(medicine, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);
        }

        public async Task<IEnumerable<MedicineDto>> SearchAsync(string query, int top = 10, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(query))
                return Enumerable.Empty<MedicineDto>();

            var allMedicines = await _unitOfWork.Medicines.GetAllAsync(cancellationToken);

            var filtered = allMedicines
                .Where(m => m.Name.Contains(query, StringComparison.OrdinalIgnoreCase))
                .OrderByDescending(m => _jaro.Similarity(m.Name, query))
                .Take(top)
                .ToList();

            return _mapper.Map<IEnumerable<MedicineDto>>(filtered);
        }

    }
}
