using FluentValidation;
using Rujta.Application.DTOs.PharmacyDto;

namespace Rujta.Application.Validation
{
    public class UpdatePharmacyDtoValidator : AbstractValidator<UpdatePharmacyDto>
    {
        public UpdatePharmacyDtoValidator()
        {
            // ===== Name =====
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Pharmacy name is required.")
                .MaximumLength(200).WithMessage("Pharmacy name must not exceed 200 characters.");

            // ===== Contact Number =====
            RuleFor(x => x.ContactNumber)
                .NotEmpty().WithMessage("Contact number is required.")
                .Matches(@"^01[0-2,5]{1}[0-9]{8}$")
                .WithMessage("Contact number must be a valid Egyptian mobile number.");

            // ===== Open Hours =====
            RuleFor(x => x.OpenHours)
                .NotEmpty().WithMessage("Open hours are required.")
                .MaximumLength(100).WithMessage("Open hours must not exceed 100 characters.");

            // ===== Address =====
            RuleFor(x => x.Address)
                .NotNull().WithMessage("Address is required.")
                .SetValidator(new AddressDtoValidator());
        }
    }
}