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
            var exists = await _identity.Identity.UserManager.FindByEmailAsync(email) != null;
            _infra.Logger.LogInformation("Email check for {Email}: {Exists}", email, exists);
            return exists;
        }

        public async Task<Guid> CreateUserAsync(RegisterDto dto, UserRole role, CancellationToken cancellationToken = default)
        {
            Person person = role switch
            {
                UserRole.User => _identity.Mapper.Map<User>(dto),
                UserRole.Pharmacist => await CreatePharmacist(dto),
                UserRole.SuperAdmin => _identity.Mapper.Map<Admin>(dto),
                UserRole.PharmacyAdmin => _identity.Mapper.Map<Manager>(dto),
                _ => throw new InvalidOperationException(AuthMessages.UnknownRole)
            };

            await _identity.UnitOfWork.People.AddAsync(person);
            await _identity.UnitOfWork.SaveAsync();

            var user = _identity.Mapper.Map<ApplicationUser>(dto);
            user.DomainPersonId = person.Id;

            var result = await _identity.Identity.UserManager.CreateAsync(user, dto.CreatePassword);
            if (!result.Succeeded)
            {
                string errors = string.Join(", ", result.Errors.Select(e => e.Description));
                _infra.Logger.LogError("User creation failed for {Email}: {Errors}", dto.Email, errors);
                throw new InvalidOperationException(errors);
            }

            await _identity.Identity.UserManager.AddToRoleAsync(user, role.ToString());
            _infra.Logger.LogInformation("User created successfully: {Email}, Role: {Role}", dto.Email, role);
            return user.Id;
        }

        private async Task<Pharmacist> CreatePharmacist(RegisterDto dto)
        {
            var pharmacistDto = dto as RegisterByAdminDto;

            if (pharmacistDto?.PharmacyId == null)
                throw new InvalidOperationException("PharmacyId is required for Pharmacist.");

            var pharmacist = _identity.Mapper.Map<Pharmacist>(dto);
            pharmacist.PharmacyId = pharmacistDto.PharmacyId.Value;


            var manager = await _identity.UnitOfWork.People
                            .GetQueryable()
                            .OfType<Manager>()
                            .FirstOrDefaultAsync(m => m.PharmacyId == pharmacist.PharmacyId);


            if (manager == null)
                throw new InvalidOperationException("No manager found for this pharmacy.");

            pharmacist.ManagerId = manager.Id;

            return pharmacist;
        }
    }
}
