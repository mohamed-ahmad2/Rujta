using FluentValidation;
using Rujta.Application.DTOs;

namespace Rujta.Application.Validation
{
    public class AddressDtoValidator : AbstractValidator<AddressDto>
    {
        public AddressDtoValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Full name is required.");

            RuleFor(x => x.MobileNumber)
                .NotEmpty().WithMessage("Mobile number is required.")
                .Matches(@"^01[0125]\d{8}$")
                .WithMessage("Mobile number must be a valid Egyptian number (e.g., 010, 011, 012, 015).");

            RuleFor(x => x.Street)
                .NotEmpty().WithMessage("Street is required.");

            RuleFor(x => x.BuildingNo)
                .NotEmpty().WithMessage("Building number is required.");

            RuleFor(x => x.City)
                .NotEmpty().WithMessage("City is required.");

            RuleFor(x => x.Governorate)
                .NotEmpty().WithMessage("Governorate is required.");
        }
    }
}
