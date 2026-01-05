using FluentValidation;
using Rujta.Application.DTOs;

namespace Rujta.Application.Validation
{
    public class DeliveryAddressDtoValidator : AbstractValidator<AddressDto?>
    {
        public DeliveryAddressDtoValidator()
        {
            RuleFor(x => x!.Street)
                .NotEmpty().WithMessage("Street is required.");

            RuleFor(x => x!.BuildingNo)
                .NotEmpty().WithMessage("Building No is required.");

            RuleFor(x => x!.City)
                .NotEmpty().WithMessage("City is required.");

            RuleFor(x => x!.Governorate)
                .NotEmpty().WithMessage("Governorate is required.");
        }
    }

}
