using FluentValidation;
using Rujta.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.Validation
{
    public class OrderItemDtoValidator : AbstractValidator<OrderItemDto>
    {
        public OrderItemDtoValidator()
        {
            
            RuleFor(x => x.MedicineID)
                .GreaterThan(0).WithMessage("Medicine ID must be greater than zero.");

            
            RuleFor(x => x.MedicineName)
                .NotEmpty().WithMessage("Medicine name is required.")
                .MaximumLength(100).WithMessage("Medicine name cannot exceed 100 characters.");

            
            RuleFor(x => x.Quantity)
                .GreaterThan(0).WithMessage("Quantity must be greater than zero.");

            
            RuleFor(x => x.Price)
                .GreaterThan(0).WithMessage("Price must be greater than zero.");
        }
    }
}
