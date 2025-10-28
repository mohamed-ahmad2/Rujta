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

       
        public async Task<IEnumerable<MedicineDto>> GetAllAsync()
        {
            var medicines = await _unitOfWork.Medicines.GetAllAsync();
            return _mapper.Map<IEnumerable<MedicineDto>>(medicines);
        }

        
        public async Task<MedicineDto?> GetByIdAsync(int id)
        {
            var medicine = await _unitOfWork.Medicines.GetByIdAsync(id);
            return _mapper.Map<MedicineDto?>(medicine);
        }

        
        public async Task AddAsync(MedicineDto dto)
        {
            var medicine = _mapper.Map<Medicine>(dto);
            await _unitOfWork.Medicines.AddAsync(medicine);
            await _unitOfWork.SaveAsync();
        }

       
        public async Task UpdateAsync(int id, MedicineDto dto)
        {
            var medicine = await _unitOfWork.Medicines.GetByIdAsync(id);
            if (medicine == null) return;

            _mapper.Map(dto, medicine);
            _unitOfWork.Medicines.Update(medicine);
            await _unitOfWork.SaveAsync();
        }

        
        public async Task DeleteAsync(int id)
        {
            var medicine = await _unitOfWork.Medicines.GetByIdAsync(id);
            if (medicine == null) return;

            _unitOfWork.Medicines.Delete(medicine);
            await _unitOfWork.SaveAsync();
        }

        public async Task<IEnumerable<MedicineDto>> SearchAsync(string query, int top = 10)
        {
            if (string.IsNullOrWhiteSpace(query))
                return Enumerable.Empty<MedicineDto>();

            var allMedicines = await _unitOfWork.Medicines.GetAllAsync();

            var results = allMedicines
                .OrderByDescending(m => _jaro.Similarity(m.Name, query))
                .Take(top)
                .ToList();

            return _mapper.Map<IEnumerable<MedicineDto>>(results);
        }
    }
}
