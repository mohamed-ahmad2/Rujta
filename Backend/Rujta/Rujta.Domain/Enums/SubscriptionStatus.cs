using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Domain.Enums
{
    public enum SubscriptionStatus
    {
        Pending = 0,   // registered but no plan chosen yet
        Active = 1,
        Expired = 2
    }
}
