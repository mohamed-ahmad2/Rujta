using FluentValidation;
using Rujta.Application.DTOs;

namespace Rujta.Application.Validation
{
    public class OrderDtoValidator : AbstractValidator<OrderDto>
    {
        public OrderDtoValidator()
        {
            RuleFor(x => x.UserID)
                .NotEmpty().WithMessage("User ID is required.");

            RuleFor(x => x.PharmacyID)
                .GreaterThan(0).WithMessage("Pharmacy ID must be greater than zero.");

            RuleFor(x => x.DeliveryAddress)
                .NotNull().WithMessage("Delivery address is required.")
                .SetValidator(new DeliveryAddressDtoValidator());

            RuleFor(x => x.TotalPrice)
                .GreaterThanOrEqualTo(0).WithMessage("Total price must be non-negative.");

            RuleFor(x => x.OrderDate)
                .LessThanOrEqualTo(DateTime.UtcNow)
                .WithMessage("Order date cannot be in the future.");

            RuleFor(x => x.OrderItems)
                .NotEmpty().WithMessage("Order must contain at least one item.");

            RuleForEach(x => x.OrderItems)
                .SetValidator(new OrderItemDtoValidator());
        }
    }
}
