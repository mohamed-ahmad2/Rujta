using AutoMapper;
using Rujta.Application.DTOs;
using Rujta.Domain.Entities;


namespace Rujta.Application.Mapper
{
    public class OrderProfile : Profile
    {
        public OrderProfile()
        {
            CreateMap<Order, OrderDto>().ReverseMap();
            CreateMap<OrderItem, OrderItemDto>().ReverseMap();
        }
    }
}
