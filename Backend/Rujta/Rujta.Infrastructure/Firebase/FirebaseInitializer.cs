using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;

namespace Rujta.Infrastructure.Firebase
{
    public static class FirebaseInitializer
    {
        public static void Initialize()
        {
            var credentialPath = Path.Combine(AppContext.BaseDirectory, "Firebase", "Service-account.json");

            if (!File.Exists(credentialPath))
                throw new FileNotFoundException("Firebase service account JSON not found.");

            var serviceAccountCredential = CredentialFactory
                .FromFile<ServiceAccountCredential>(credentialPath)
                .ToGoogleCredential();

            FirebaseApp.Create(new AppOptions
            {
                Credential = serviceAccountCredential
            });
        }
    }
}
