using Rujta.Application.DTOs.PharmacyDtos;


namespace Rujta.Application.Mapper
{
    public static class PharmacyMappingExtensions
    {
        public static IMappingExpression<PharmacyDto, Pharmacy> IgnoreNavigationProperties(
            this IMappingExpression<PharmacyDto, Pharmacy> map)
        {
            return map
                .ForMember(d => d.Admin, o => o.Ignore())
                .ForMember(d => d.Manager, o => o.Ignore())
                .ForMember(d => d.Orders, o => o.Ignore())
                .ForMember(d => d.Employees, o => o.Ignore())
                .ForMember(d => d.InventoryItems, o => o.Ignore())
                .ForMember(d => d.Subscription, o => o.Ignore())
                .ForMember(d => d.Customers, o => o.Ignore())
                .ForMember(d => d.Discounts, o => o.Ignore())
                .ForMember(d => d.Branches, o => o.Ignore())
                .ForMember(d => d.ParentPharmacy, o => o.Ignore())
                .ForMember(d => d.SellDrugViaPharmacy, o => o.Ignore());
        }
    }
}