using Rujta.Application.DTOs.MedicineDtos;
using Rujta.Application.Interfaces.InterfaceServices.IMedicine;
using Rujta.Application.Notifications;

namespace Rujta.Application.Services
{
    public class DrugRequestService : IDrugRequestService
    {
        private readonly IDrugRequestRepository _repo;
        private readonly INotificationPublisher _notifier;
        private readonly INotificationService _notificationService;
        private readonly IUnitOfWork _unitOfWork;           
        private readonly IMapper _mapper;
        private readonly IMedicineService _medicineService;
        private readonly ILogger<DrugRequestService> _logger;

        public DrugRequestService(
            IDrugRequestRepository repo,
            INotificationPublisher notifier,
            INotificationService notificationService,
            IUnitOfWork unitOfWork,                         
            IMapper mapper,
            IMedicineService medicineService,
            ILogger<DrugRequestService> logger)
        {
            _repo = repo;
            _notifier = notifier;
            _notificationService = notificationService;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _medicineService = medicineService;
            _logger = logger;
        }

   
        public async Task<DrugRequestDto> SubmitAsync(
            CreateDrugRequestDto dto,
            int pharmacyId,
            string userId,
            CancellationToken ct = default)
        {
            var entity = _mapper.Map<DrugRequest>(dto);
            entity.PharmacyId = pharmacyId;
            entity.SubmittedByUserId = userId;
            entity.Status = DrugRequestStatus.Pending;
            entity.CreatedAt = DateTime.UtcNow;

            await _repo.AddAsync(entity, ct);

        
            await _unitOfWork.SaveAsync(ct);

            _logger.LogInformation(
                "Drug request {Id} created by Pharmacy {PharmacyId}",
                entity.Id, pharmacyId);

 
            await SafePublishAsync(
                () => _notifier.PublishToGroupAsync(
                    group: "SuperAdmins",
                    method: "NewDrugRequest",
                    payload: new
                    {
                        requestId = entity.Id,     
                        drugName = entity.DrugName,
                        pharmacyId = entity.PharmacyId,
                        submittedAt = entity.CreatedAt
                    }),
                $"NewDrugRequest event for request {entity.Id}");

            return _mapper.Map<DrugRequestDto>(entity);
        }

   
        public async Task<IEnumerable<DrugRequestDto>> GetMyRequestsAsync(
            int pharmacyId,
            CancellationToken ct = default)
        {
            var items = await _repo.GetByPharmacyIdAsync(pharmacyId, ct);
            return _mapper.Map<IEnumerable<DrugRequestDto>>(items);
        }

 
        public async Task<IEnumerable<DrugRequestDto>> GetAllAsync(
            DrugRequestStatus? status = null,
            int? pharmacyId = null,
            CancellationToken ct = default)
        {
            var items = await _repo.GetAllWithFilterAsync(status, pharmacyId, ct);
            return _mapper.Map<IEnumerable<DrugRequestDto>>(items);
        }

   
        public async Task<DrugRequestDto> ReviewAsync(
            int requestId,
            ReviewDrugRequestDto dto,
            string adminId,
            CancellationToken ct = default)
        {
            var entity = await _repo.GetByIdAsync(requestId, ct)
                         ?? throw new KeyNotFoundException(
                             $"DrugRequest {requestId} not found.");

            if (entity.Status != DrugRequestStatus.Pending)
                throw new InvalidOperationException(
                    "Only pending requests can be reviewed.");

            entity.ReviewedByAdminId = adminId;
            entity.ReviewedAt = DateTime.UtcNow;

            if (dto.Approved)
            {
                entity.Status = DrugRequestStatus.Approved;
            }
            else
            {
                if (string.IsNullOrWhiteSpace(dto.RejectionReason))
                    throw new ArgumentException("A rejection reason is required.");

                entity.Status = DrugRequestStatus.Rejected;
                entity.RejectionReason = dto.RejectionReason;
            }

            await _repo.UpdateAsync(entity, ct);

    
            if (dto.Approved)
            {
                try
                {
                    var medicineDto = new MedicineDto
                    {
                        Name = entity.DrugName,
                        Description = entity.Description,
                        Price = entity.Price,
                        ExpiryDate = entity.ExpiryDate,
                        CompanyName = entity.Manufacturer,
                    };

                    await _medicineService.AddAsync(medicineDto, ct);

                    _logger.LogInformation(
                        "Drug '{DrugName}' from request {Id} added to central database",
                        entity.DrugName, entity.Id);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex,
                        "Failed to add approved drug '{DrugName}' to central database (request {Id})",
                        entity.DrugName, entity.Id);
                }
            }

      
            await _unitOfWork.SaveAsync(ct);

            _logger.LogInformation(
                "💊 Drug request {Id} {Status} by Admin {AdminId}",
                entity.Id, entity.Status, adminId);

     
            var statusString = entity.Status.ToString();
            var reviewPayload = new
            {
                requestId = entity.Id,
                drugName = entity.DrugName,
                status = statusString,
                rejectionReason = entity.RejectionReason
            };


            await SafePublishAsync(
                () => _notifier.PublishToGroupAsync(
                    group: $"Pharmacy-{entity.PharmacyId}",
                    method: "DrugRequestReviewed",
                    payload: reviewPayload),
                $"DrugRequestReviewed → Pharmacy-{entity.PharmacyId} (request {entity.Id})");

   
            if (!string.IsNullOrWhiteSpace(entity.SubmittedByUserId))
            {
                await SafePublishAsync(
                    () => _notifier.PublishToGroupAsync(
                        group: $"User-{entity.SubmittedByUserId}",
                        method: "DrugRequestReviewed",
                        payload: reviewPayload),
                    $"DrugRequestReviewed → User-{entity.SubmittedByUserId} (request {entity.Id})");
            }

 
            await SafePublishAsync(
                () => _notifier.PublishToGroupAsync(
                    group: "SuperAdmins",
                    method: "DrugRequestReviewed",
                    payload: reviewPayload),
                $"DrugRequestReviewed broadcast → SuperAdmins (request {entity.Id})");

   
            try
            {
                var title = dto.Approved
                    ? "Drug Request Approved ✅"
                    : "Drug Request Rejected ❌";

                var message = dto.Approved
                    ? $"\"{entity.DrugName}\" has been approved and added to the database."
                    : $"\"{entity.DrugName}\" was rejected. Reason: {entity.RejectionReason ?? "No reason provided"}";

                var payloadJson = System.Text.Json.JsonSerializer.Serialize(new
                {
                    requestId = entity.Id,
                    type = "drug-review",
                    status = statusString
                });

                if (!string.IsNullOrWhiteSpace(entity.SubmittedByUserId))
                {
                    await _notificationService.SendNotificationAsync(
                        entity.SubmittedByUserId,
                        title,
                        message,
                        payloadJson);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Failed to persist drug-review notification for request {Id}",
                    entity.Id);
            }

            return _mapper.Map<DrugRequestDto>(entity);
        }
        private async Task SafePublishAsync(Func<Task> publishAction, string description)
        {
            try
            {
                await publishAction();
                _logger.LogInformation("📣 Published {Description}", description);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Failed to publish {Description}",
                    description);
            }
        }
    }
}