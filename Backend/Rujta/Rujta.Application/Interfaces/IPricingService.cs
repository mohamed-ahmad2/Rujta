using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Rujta.Application.DTOs;

namespace Rujta.Application.Interfaces
{
    public interface IPricingService
    {
        Task<PricingConfigDto> GetAsync(CancellationToken cancellationToken = default);
        Task<PricingConfigDto> UpdateAsync(PricingConfigDto dto, CancellationToken cancellationToken = default);
    }
}
