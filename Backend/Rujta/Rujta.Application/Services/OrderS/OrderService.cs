using Rujta.Application.Interfaces.InterfaceServices.IOrder;

namespace Rujta.Application.Services.OrderS
{
    public partial class OrderService(
        IUnitOfWork _unitOfWork,
        IMapper _mapper,
        IDrugInteractionService _drugInteractionService,
        ILogger<OrderService> _logger,
        IOrderNotificationService _notificationService,
        INotificationService NotifyService) : IOrderService
    {
        
    }
}