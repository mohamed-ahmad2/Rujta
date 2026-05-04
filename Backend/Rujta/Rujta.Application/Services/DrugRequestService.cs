using AutoMapper;
using Microsoft.AspNetCore.SignalR;
using Rujta.Application.DTOs; 
using Rujta.Application.Interfaces.InterfaceRepositories;
using Rujta.Application.Interfaces.InterfaceServices;
using Rujta.Application.Notifications;
using Rujta.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Rujta.Application.DTOs.MedicineDtos;
using Rujta.Application.Interfaces.InterfaceServices.IMedicine;

namespace Rujta.Application.Services
{
    public class DrugRequestService : IDrugRequestService
    {
        private readonly IDrugRequestRepository _repo;
        private readonly INotificationPublisher _notifier;
        private readonly IMapper _mapper;
        private readonly IMedicineService _medicineService;
        public DrugRequestService(
            IDrugRequestRepository repo,
            INotificationPublisher notifier,
            IMapper mapper,
        IMedicineService medicineService)
        {
            _repo = repo;
            _notifier = notifier;
            _mapper = mapper;
            _medicineService = medicineService;
        }

        // ── PharmacyAdmin: submit a new request ──────────────────
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

            // Notify all SuperAdmins in real-time via SignalR
            await _notifier.PublishToGroupAsync(
                group: "SuperAdmins",
                method: "NewDrugRequest",
                payload: new
                {
                    requestId = entity.Id,
                    drugName = entity.DrugName,
                    pharmacyId = entity.PharmacyId,
                    submittedAt = entity.CreatedAt
                });

            return _mapper.Map<DrugRequestDto>(entity);
        }

        // ── PharmacyAdmin: view own pharmacy's requests ──────────
        public async Task<IEnumerable<DrugRequestDto>> GetMyRequestsAsync(
            int pharmacyId,
            CancellationToken ct = default)
        {
            var items = await _repo.GetByPharmacyIdAsync(pharmacyId, ct);
            return _mapper.Map<IEnumerable<DrugRequestDto>>(items);
        }

        // ── SuperAdmin: list all requests (optionally filtered) ───
        public async Task<IEnumerable<DrugRequestDto>> GetAllAsync(
            DrugRequestStatus? status = null,
            int? pharmacyId = null,
            CancellationToken ct = default)
        {
            var items = await _repo.GetAllWithFilterAsync(status, pharmacyId, ct);
            return _mapper.Map<IEnumerable<DrugRequestDto>>(items);
        }

        // ── SuperAdmin: approve or reject ────────────────────────
        public async Task<DrugRequestDto> ReviewAsync(
            int requestId,
            ReviewDrugRequestDto dto,
            string adminId,
            CancellationToken ct = default)
        {
            var entity = await _repo.GetByIdAsync(requestId, ct)
                         ?? throw new KeyNotFoundException($"DrugRequest {requestId} not found.");

            if (entity.Status != DrugRequestStatus.Pending)
                throw new InvalidOperationException("Only pending requests can be reviewed.");

            entity.ReviewedByAdminId = adminId;
            entity.ReviewedAt = DateTime.UtcNow;

            if (dto.Approved)
            {
                entity.Status = DrugRequestStatus.Approved;

                var medicineDto = new MedicineDto
                {
                    Name = entity.DrugName,
                    Description = entity.Description,
                    Price = entity.Price,
                    ExpiryDate = entity.ExpiryDate,
                    CompanyName = entity.Manufacturer,
                };

                await _medicineService.AddAsync(medicineDto, ct);
            }
            else
            {
                if (string.IsNullOrWhiteSpace(dto.RejectionReason))
                    throw new ArgumentException("A rejection reason is required.");

                entity.Status = DrugRequestStatus.Rejected;
                entity.RejectionReason = dto.RejectionReason;
            }

            await _repo.UpdateAsync(entity, ct);

            // Notify the pharmacy that submitted the request
            await _notifier.PublishToGroupAsync(
                group: $"Pharmacy-{entity.PharmacyId}",
                method: "DrugRequestReviewed",
                payload: new
                {
                    requestId = entity.Id,
                    drugName = entity.DrugName,
                    status = entity.Status.ToString(),
                    rejectionReason = entity.RejectionReason
                });

            return _mapper.Map<DrugRequestDto>(entity);
        }
    }
}
