using FluentValidation;
using Rujta.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.Validation
{
    public class MedicineDtoValidator : AbstractValidator<MedicineDto>
    {
        public MedicineDtoValidator()
        {
            
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Medicine name is required.")
                .MaximumLength(100).WithMessage("Medicine name cannot exceed 100 characters.");

            
            RuleFor(x => x.Description)
                .MaximumLength(500).WithMessage("Description cannot exceed 500 characters.")
                .When(x => !string.IsNullOrWhiteSpace(x.Description));

            
            RuleFor(x => x.Dosage)
                .MaximumLength(100).WithMessage("Dosage text cannot exceed 100 characters.")
                .When(x => !string.IsNullOrWhiteSpace(x.Dosage));

            
            RuleFor(x => x.Price)
                .GreaterThan(0).WithMessage("Price must be greater than zero.");

            
            RuleFor(x => x.ExpiryDate)
                .GreaterThan(DateTime.UtcNow).WithMessage("Expiry date must be in the future.");

            
            RuleFor(x => x.ActiveIngredient)
                .MaximumLength(100).WithMessage("Active ingredient name cannot exceed 100 characters.")
                .When(x => !string.IsNullOrWhiteSpace(x.ActiveIngredient));
        }
    }
}
