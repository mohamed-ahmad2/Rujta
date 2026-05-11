using AutoMapper;
using Rujta.Application.DTOs.OrderDto;
using Rujta.Domain.Entities;

namespace Rujta.Application.Mapper
{
    public class OrderProfile : Profile
    {
        public OrderProfile()
        {
            CreateMap<Order, OrderDto>()
                .ForMember(dest => dest.UserID,
                    opt => opt.MapFrom(src => src.UserId ?? Guid.Empty))

                .ForMember(dest => dest.PharmacyID,
                    opt => opt.MapFrom(src => src.PharmacyId))

                .ForMember(dest => dest.UserName,
                    opt => opt.MapFrom(src =>
                        src.User != null ? src.User.Name : string.Empty))

                .ForMember(dest => dest.CustomerName,
                    opt => opt.MapFrom(src =>
                        src.Customer != null ? src.Customer.Name : string.Empty))

                .ForMember(dest => dest.PharmacyName,
                    opt => opt.MapFrom(src =>
                        src.Pharmacy != null ? src.Pharmacy.Name : string.Empty))

                .ForMember(dest => dest.OrderItems,
                    opt => opt.MapFrom(src => src.OrderItems));

            CreateMap<OrderItem, OrderItemDto>()
                .ForMember(dest => dest.MedicineName,
                    opt => opt.MapFrom(src =>
                        src.Medicine != null ? src.Medicine.Name : string.Empty));
        }
    }
}