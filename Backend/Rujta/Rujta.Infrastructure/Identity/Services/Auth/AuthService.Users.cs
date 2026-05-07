using Rujta.Application.DTOs.AuthDto;
using Rujta.Domain.Common;

namespace Rujta.Infrastructure.Identity.Services.Auth
{
    public partial class AuthService
    {
        public async Task<ApplicationUserDto?> GetUserByEmailAsync(string email)
        {
            _infra.Logger.LogInformation("Fetching user by email: {Email}", email);
            return await _identity.UnitOfWork.Users.GetByEmailAsync(email);
        }

        public async Task<bool> IsEmailExistsAsync(string email, CancellationToken cancellationToken = default)
        {
            var existsInIdentity = await _identity.Identity.UserManager.FindByEmailAsync(email) != null;

            var normalizedEmail = email.Trim().ToLowerInvariant();
            var existsInPeople = await _identity.UnitOfWork.People
                .GetQueryable()
                .AnyAsync(p => p.Email != null && p.Email.ToLower() == normalizedEmail, cancellationToken);

            var exists = existsInIdentity || existsInPeople;
            _infra.Logger.LogInformation("Email check for {Email}: {Exists}", email, exists);
            return exists;
        }

        public async Task<Guid> CreateUserAsync(RegisterDto dto, UserRole role, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(dto.Email))
                throw new InvalidOperationException("Email is required.");

            var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
            dto.Email = normalizedEmail;


            if (await IsEmailExistsAsync(normalizedEmail, cancellationToken))
            {
                _infra.Logger.LogWarning(
                    "Registration blocked: email already exists ({Email})",
                    normalizedEmail);
                throw new InvalidOperationException("Email is already registered.");
            }

            try
            {
                var userId = await _identity.UnitOfWork.ExecuteInTransactionAsync(async ct =>
                {
                    Person person = role switch
                    {
                        UserRole.User => _identity.Mapper.Map<User>(dto),
                        UserRole.SuperAdmin => _identity.Mapper.Map<Admin>(dto),
                        UserRole.PharmacyAdmin => _identity.Mapper.Map<Manager>(dto),
                        _ => throw new InvalidOperationException(AuthMessages.UnknownRole)
                    };

                    person.Email = normalizedEmail;

                    await _identity.UnitOfWork.People.AddAsync(person);
                    await _identity.UnitOfWork.SaveAsync(ct);

                    var user = _identity.Mapper.Map<ApplicationUser>(dto);
                    user.DomainPersonId = person.Id;
                    user.Email = normalizedEmail;
                    user.UserName = normalizedEmail;

                    person.PhoneNumber = user.PhoneNumber ?? string.Empty;

                    if (!string.IsNullOrWhiteSpace(user.Location))
                        person.Addresses.Add(new Address { City = user.Location });

                    var result = await _identity.Identity.UserManager
                        .CreateAsync(user, dto.CreatePassword);

                    if (!result.Succeeded)
                    {
                        string errors = string.Join(", ", result.Errors.Select(e => e.Description));
                        _infra.Logger.LogError(
                            "User creation failed for {Email}: {Errors}",
                            dto.Email, errors);


                        throw new InvalidOperationException(errors);
                    }

                    var roleResult = await _identity.Identity.UserManager
                        .AddToRoleAsync(user, role.ToString());

                    if (!roleResult.Succeeded)
                    {
                        string errors = string.Join(", ", roleResult.Errors.Select(e => e.Description));
                        _infra.Logger.LogError(
                            "AddToRole failed for {Email}: {Errors}",
                            dto.Email, errors);

                        throw new InvalidOperationException(errors);
                    }

                    _infra.Logger.LogInformation(
                        "User created successfully: {Email}, Role: {Role}",
                        dto.Email, role);

                    return user.Id;

                }, cancellationToken);

                return userId;
            }
            catch (InvalidOperationException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _infra.Logger.LogError(ex,
                    "Unexpected error during user creation for {Email}",
                    dto.Email);

                throw new InvalidOperationException(
                    $"An unexpected error occurred while creating user '{dto.Email}'. See inner exception for details.",
                    ex);
            }
        }

        public async Task<Guid> CreatePharmacistUserAsync(CreatePharmacistDto dto,int pharmacyId, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(dto.Email))
                throw new InvalidOperationException("Email is required.");

            var normalizedEmail = dto.Email.Trim().ToLowerInvariant();

            if (await IsEmailExistsAsync(normalizedEmail, cancellationToken))
                throw new InvalidOperationException("Email is already registered.");

            try
            {
                var userId = await _identity.UnitOfWork.ExecuteInTransactionAsync(async ct =>
                {
                    var pharmacist = await CreatePharmacist(dto, pharmacyId);

                    await _identity.UnitOfWork.People.AddAsync(pharmacist);
                    await _identity.UnitOfWork.SaveAsync(ct);

                    var user = _identity.Mapper.Map<ApplicationUser>(dto);
                    user.DomainPersonId = pharmacist.Id;
                    user.Email = normalizedEmail;
                    user.UserName = normalizedEmail;

                    pharmacist.PhoneNumber = user.PhoneNumber ?? string.Empty;

                    if (!string.IsNullOrWhiteSpace(dto.Location))
                        pharmacist.Addresses.Add(new Address { City = dto.Location });

                    var result = await _identity.Identity.UserManager
                        .CreateAsync(user, dto.CreatePassword);

                    if (!result.Succeeded)
                    {
                        var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                        throw new InvalidOperationException(errors);
                    }

                    var roleResult = await _identity.Identity.UserManager
                        .AddToRoleAsync(user, UserRole.Pharmacist.ToString());

                    if (!roleResult.Succeeded)
                    {
                        var errors = string.Join(", ", roleResult.Errors.Select(e => e.Description));
                        throw new InvalidOperationException(errors);
                    }

                    return user.Id;

                }, cancellationToken);

                return userId;
            }
            catch (Exception ex)
            {
                _infra.Logger.LogError(ex,
                    "Error creating pharmacist user for {Email}",
                    dto.Email);

                throw new InvalidOperationException(
                    $"An unexpected error occurred while creating user '{dto.Email}'. See inner exception for details.",
                    ex);
            }
        }

        private async Task<Pharmacist> CreatePharmacist(CreatePharmacistDto dto, int pharmacyId)
        {
            var pharmacist = _identity.Mapper.Map<Pharmacist>(dto);

            pharmacist.PharmacyId = pharmacyId;

            var manager = await _identity.UnitOfWork.People
                .GetQueryable()
                .OfType<Manager>()
                .FirstOrDefaultAsync(m => m.PharmacyId == pharmacyId);

            if (manager == null)
                throw new InvalidOperationException("No manager found for this pharmacy.");

            pharmacist.ManagerId = manager.Id;

            return pharmacist;
        }
    }
}