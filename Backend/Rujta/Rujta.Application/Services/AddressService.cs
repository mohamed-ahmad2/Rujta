using AutoMapper;
using Rujta.Application.DTOs;
using Rujta.Application.Interfaces;
using Rujta.Application.Interfaces.InterfaceServices;
using Rujta.Domain.Entities;

namespace Rujta.Application.Services
{
    public class AddressService : IAddressService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public AddressService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task AddAsync(AddressDto dto, CancellationToken cancellationToken = default)
        {
            var address = _mapper.Map<Address>(dto);

            await _unitOfWork.Address.AddAsync(address, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);
        }


        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var address = await _unitOfWork.Address.GetByIdAsync(id, cancellationToken);
            if (address == null)
                throw new KeyNotFoundException("Address not found");

            await _unitOfWork.Address.DeleteAsync(address, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);
        }


        public async Task<IEnumerable<AddressDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var addresses = await _unitOfWork.Address.GetAllAsync(cancellationToken);
            return _mapper.Map<IEnumerable<AddressDto>>(addresses);
        }


        public async Task<AddressDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var address = await _unitOfWork.Address.GetByIdAsync(id, cancellationToken);
            return address == null ? null : _mapper.Map<AddressDto>(address);
        }

        public async Task<List<AddressDto>> GetUserAddressesAsync(Guid userId,CancellationToken cancellationToken = default)
        {
            if (userId == Guid.Empty)
                throw new ArgumentException("Invalid userId");

            var addresses = await _unitOfWork.Address
                .GetUserAddressesAsync(userId, cancellationToken);

            if (addresses == null || !addresses.Any())
                return new List<AddressDto>();

            return _mapper.Map<List<AddressDto>>(addresses);
        }



        public async Task UpdateAsync(int id, AddressDto dto, CancellationToken cancellationToken = default)
        {
            var address = await _unitOfWork.Address.GetByIdAsync(id, cancellationToken);
            if (address == null)
                throw new KeyNotFoundException("Address not found");

            _mapper.Map(dto, address);

            await _unitOfWork.Address.UpdateAsync(address, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);
        }
    }
}
