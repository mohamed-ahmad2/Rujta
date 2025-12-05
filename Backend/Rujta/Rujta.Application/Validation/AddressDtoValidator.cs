using FluentValidation;
using Rujta.Application.DTOs;

namespace Rujta.Application.Validation
{
    public class AddressDtoValidator : AbstractValidator<AddressDto>
    {
        public AddressDtoValidator()
        {
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
