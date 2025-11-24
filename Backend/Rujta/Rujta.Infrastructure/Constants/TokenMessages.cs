using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Infrastructure.Constants
{
    public static class TokenMessages
    {
        public const string JwtCertificatePasswordNotFound =
            "JWT certificate password not found in environment variables.";

        public const string JwtCertificateFileNotFound =
            "Certificate file not found at path: {0}";

        public const string UserNotFound = "User not found";
        public const string InvalidRefreshToken = "Invalid or expired refresh token.";
        public const string DeviceIdRequired = "Missing device identifier.";
        public const string RefreshTokenVerificationFailed = "Refresh token verification failed.";
        public const string RefreshTokenUsedFromUnknownDevice = "Refresh token used from unknown device";
        public const string InvalidAccessTokenParameter = "Invalid refresh token";
        public const string CannotInitTokenServiceWithoutJWTCertificate = "Cannot initialize TokenService without JWT certificate";
    }
}
