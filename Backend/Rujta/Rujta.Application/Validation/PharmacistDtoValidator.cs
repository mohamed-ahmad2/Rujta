using FluentValidation;
using Rujta.Application.DTOs.PharmacyDto;

namespace Rujta.Application.Validation
{
    public class PharmacistDtoValidator : AbstractValidator<PharmacistDto>
    {
        public PharmacistDtoValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Full name is required.")
                .MaximumLength(150).WithMessage("Full name must not exceed 150 characters.");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("Invalid email format.");

            RuleFor(x => x.Phone)
                .NotEmpty().WithMessage("Phone is required.")
                .Matches(@"^01[0-2,5]{1}[0-9]{8}$")
                .WithMessage("Invalid Egyptian phone number.");

            RuleFor(x => x.Position)
                .NotEmpty().WithMessage("Position is required.")
                .MaximumLength(100);

            RuleFor(x => x.HireDate)
                .NotNull().WithMessage("Hire date is required.")
                .LessThanOrEqualTo(DateTime.UtcNow)
                .WithMessage("Hire date cannot be in the future.");

            RuleFor(x => x.Salary)
                .NotNull().WithMessage("Salary is required.")
                .GreaterThan(0).WithMessage("Salary must be greater than 0.");

            RuleFor(x => x.ManagerID)
                .Must(id => id == null || id != Guid.Empty)
                .WithMessage("ManagerID cannot be empty Guid.");

            RuleFor(x => x.PharmacyID)
                .NotNull().WithMessage("PharmacyID is required.")
                .GreaterThan(0).WithMessage("PharmacyID must be valid.");
        }
    }
}