using FluentValidation;

namespace Rujta.Application.Validation
{
    public class CreateOrderDtoValidator : AbstractValidator<CreateOrderDto>
    {
        public CreateOrderDtoValidator()
        {
            RuleFor(x => x.PrescriptionID)
                .GreaterThan(0).When(x => x.PrescriptionID.HasValue)
                .WithMessage("Prescription ID must be greater than zero if provided.");
            
            RuleFor(x => x.OrderItems)
                .NotEmpty().WithMessage("Order must contain at least one item.");

            RuleForEach(x => x.OrderItems)
                .SetValidator(new OrderItemDtoValidator());
        }
    }
}
