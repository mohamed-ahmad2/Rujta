using FluentValidation;
using Rujta.Application.DTOs.PharmacyDto;

namespace Rujta.Application.Validation
{
    public class CreatePharmacyDtoValidator : AbstractValidator<CreatePharmacyDto>
    {
        public CreatePharmacyDtoValidator()
        {
            RuleFor(x => x.PharmacyName)
                .NotEmpty().WithMessage("Pharmacy name is required.")
                .MaximumLength(150).WithMessage("Pharmacy name must not exceed 150 characters.");

            RuleFor(x => x.OpenHours)
                .NotEmpty().WithMessage("Open hours are required.")
                .MaximumLength(50).WithMessage("Open hours must not exceed 50 characters.");

      
            RuleFor(x => x.Image)
                .Must(file => file == null || file.Length <= 5 * 1024 * 1024)
                .WithMessage("Image size must not exceed 5MB.");

            RuleFor(x => x.Image)
                .Must(file => file == null ||
                              file.ContentType == "image/jpeg" ||
                              file.ContentType == "image/png")
                .WithMessage("Only JPG or PNG images are allowed.");

          
            RuleFor(x => x.Address)
                .SetValidator(new AddressDtoValidator());

    
            RuleFor(x => x.ManagerName)
                .NotEmpty().WithMessage("Manager name is required.")
                .MaximumLength(100);

            RuleFor(x => x.ManagerEmail)
                .NotEmpty().WithMessage("Manager email is required.")
                .EmailAddress().WithMessage("Invalid email format.");

            RuleFor(x => x.ManagerPhone)
                .NotEmpty().WithMessage("Manager phone is required.")
                .Matches(@"^01[0125]\d{8}$")
                .WithMessage("Invalid Egyptian phone number.");

            RuleFor(x => x.ManagerQualification)
                .NotEmpty().WithMessage("Manager qualification is required.")
                .MaximumLength(100);

            RuleFor(x => x.ManagerExperienceYears)
                .GreaterThanOrEqualTo(0)
                .LessThanOrEqualTo(60)
                .WithMessage("Experience years must be between 0 and 60.");

            RuleFor(x => x.ParentPharmacyId)
                .GreaterThan(0)
                .When(x => x.ParentPharmacyId.HasValue)
                .WithMessage("Invalid ParentPharmacyId.");
        }
    }
}