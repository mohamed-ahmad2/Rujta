using FluentValidation;
using Rujta.Application.DTOs;
using Rujta.Infrastructure.Identity;

namespace Rujta.Application.Validation
{
    public class CreatePharmacistDtoValidator : AbstractValidator<CreatePharmacistDto>
    {
        public CreatePharmacistDtoValidator()
        {
            Include(new RegisterDtoValidator());

            RuleFor(x => x.Position)
                .NotEmpty().WithMessage("Position is required.")
                .Must(p => p == UserRole.Pharmacist.ToString())
                .WithMessage("Invalid position for pharmacist creation.");

            RuleFor(x => x.Salary)
                .GreaterThan(0).WithMessage("Salary must be greater than 0.")
                .LessThanOrEqualTo(1000000).WithMessage("Salary is too high.");

            RuleFor(x => x.HireDate)
                .NotEmpty().WithMessage("Hire date is required.")
                .LessThanOrEqualTo(DateTime.UtcNow)
                .WithMessage("Hire date cannot be in the future.");

            RuleFor(x => x.ManagerId)
                .NotEmpty().When(x => x.ManagerId.HasValue)
                .WithMessage("ManagerId is invalid.");
        }
    }
}