namespace Rujta.Domain.Enums
{
    public enum ProcessStatus
    {
        Pending = 0,             
        Accepted = 1,           
        Processing = 2,        
        OutForDelivery = 3,     
        Delivered = 4,           
        CancelledByUser = 5,     
        CancelledByPharmacy = 6
    }
}
