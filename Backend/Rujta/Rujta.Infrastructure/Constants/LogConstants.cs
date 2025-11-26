using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Infrastructure.Constants
{
    public static class LogConstants
    {
        public const string UnknownUser = "UnknownUser";
        public const string RefreshTokenNotExist = "refreshToken not exist in cookies";
        public const string UserLoggedIn = "User logged in successfully";
        public const string FailedLogin = "Failed login attempt";
        public const string NewUserRegistered = "New user registered";
        public const string RefreshTokenUsed = "Refresh token used";
        public const string LogoutMessage = "User logged out";

        public const string UserNotFound = "User not found";
        public const string PasswordCheck = "Password check";
        public const string CreatedUser = "Created user";
        public const string LogoutExecuted = "Logout executed";
        public const string SentTestNotification = "Sent test notification";

        public const string JWTCertificateLoadedSuccessfully = "JWT certificate loaded successfully";
        public const string FailedToLoadJWTCertificate = "Failed to load JWT certificate";
    }
}
