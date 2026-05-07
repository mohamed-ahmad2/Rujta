using FluentValidation;
using Rujta.Application.DTOs.PharmacyDto;

namespace Rujta.Application.Validation
{
    public class UpdatePharmacyDtoValidator : AbstractValidator<UpdatePharmacyDto>
    {
        public UpdatePharmacyDtoValidator()
        {
 
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Name is required.")
                .MaximumLength(150);

   
            RuleFor(x => x.ContactNumber)
                .NotEmpty().WithMessage("Contact number is required.")
                .Matches(@"^01[0125]\d{8}$")
                .WithMessage("Invalid Egyptian phone number.");

   
            RuleFor(x => x.OpenHours)
                .NotEmpty().WithMessage("Open hours is required.")
                .MaximumLength(50);


            RuleFor(x => x.Address)
                .SetValidator(new AddressDtoValidator());
        }
    }
}