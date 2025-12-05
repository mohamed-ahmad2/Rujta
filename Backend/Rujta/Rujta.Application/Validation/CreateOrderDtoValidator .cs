using FluentValidation;
using Rujta.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.Validation
{
    public class CreateOrderDtoValidator : AbstractValidator<CreateOrderDto>
    {
        public CreateOrderDtoValidator()
        {
            RuleFor(x => x.PrescriptionID)
                .GreaterThan(0).When(x => x.PrescriptionID.HasValue)
                .WithMessage("Prescription ID must be greater than zero if provided.");

            RuleFor(x => x.DeliveryAddress)
                .NotEmpty().WithMessage("Delivery address is required.")
                .MaximumLength(200).WithMessage("Delivery address cannot exceed 200 characters.");

            
            RuleFor(x => x.OrderItems)
                .NotEmpty().WithMessage("Order must contain at least one item.");

            RuleForEach(x => x.OrderItems)
                .SetValidator(new OrderItemDtoValidator());
        }
    }
}
