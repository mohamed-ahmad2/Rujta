using FluentValidation;
using Rujta.Application.DTOs;


namespace Rujta.Application.Validation
{
    public class OrderItemDtoValidator : AbstractValidator<OrderItemDto>
    {
        public OrderItemDtoValidator()
        {
            RuleFor(x => x.MedicineID)
                .GreaterThan(0).WithMessage("Medicine ID must be greater than zero.");

            RuleFor(x => x.Quantity)
                .GreaterThan(0).WithMessage("Quantity must be greater than zero.");
        }
    }
}
