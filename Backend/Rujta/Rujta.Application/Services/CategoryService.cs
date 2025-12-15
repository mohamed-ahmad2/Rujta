using AutoMapper;
using Rujta.Application.DTOs;
using Rujta.Application.Interfaces;
using Rujta.Application.Interfaces.InterfaceServices;
using Rujta.Domain.Entities;

namespace Rujta.Application.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public CategoryService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task AddAsync(CategoryDto dto, CancellationToken cancellationToken = default)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            var category = _mapper.Map<Category>(dto);
            await _unitOfWork.Categories.AddAsync(category, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var category = await _unitOfWork.Categories.GetByIdAsync(id, cancellationToken);
            if (category == null)
                throw new KeyNotFoundException($"Category with Id={id} not found.");

            await _unitOfWork.Categories.DeleteAsync(category, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);
        }

        public async Task<IEnumerable<CategoryDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var categories = await _unitOfWork.Categories.GetAllAsync(cancellationToken);
            return _mapper.Map<IEnumerable<CategoryDto>>(categories);
        }

        public async Task<CategoryDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var category = await _unitOfWork.Categories.GetByIdAsync(id, cancellationToken);
            if (category == null) return null;

            return _mapper.Map<CategoryDto>(category);
        }

        public async Task UpdateAsync(int id, CategoryDto dto, CancellationToken cancellationToken = default)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            var category = await _unitOfWork.Categories.GetByIdAsync(id, cancellationToken);
            if (category == null)
                throw new KeyNotFoundException($"Category with Id={id} not found.");

            _mapper.Map(dto, category);

            await _unitOfWork.Categories.UpdateAsync(category, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);
        }
    }
}
