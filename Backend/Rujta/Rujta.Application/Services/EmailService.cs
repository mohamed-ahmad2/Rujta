using Microsoft.Extensions.Configuration;
using System.Net.Mail;
using System.Net;

namespace Rujta.Application.Services
{
    public class EmailService(IConfiguration _configuration) : IEmailService
    {
        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            try
            {
                var settings = _configuration.GetSection("EmailSettings");

                string smtpHost = settings["SmtpHost"]
                    ?? throw new InvalidOperationException("SmtpHost is missing in configuration.");
                string smtpPortStr = settings["SmtpPort"]
                    ?? throw new InvalidOperationException("SmtpPort is missing in configuration.");
                string senderEmail = settings["SenderEmail"]
                    ?? throw new InvalidOperationException("SenderEmail is missing in configuration.");
                string senderName = settings["SenderName"] ?? string.Empty;
                string password = settings["SenderPassword"]
                    ?? throw new InvalidOperationException("SenderPassword is missing in configuration.");

                if (!int.TryParse(smtpPortStr, out int smtpPort))
                    throw new InvalidOperationException("SmtpPort is not a valid number.");

                if (string.IsNullOrWhiteSpace(toEmail))
                    throw new ArgumentException("Recipient email cannot be null or empty.", nameof(toEmail));

                System.Net.ServicePointManager.SecurityProtocol =
                    SecurityProtocolType.Tls12 | SecurityProtocolType.Tls13;

                using var client = new SmtpClient(smtpHost, smtpPort)
                {
                    EnableSsl = true,
                    DeliveryMethod = SmtpDeliveryMethod.Network,
                    UseDefaultCredentials = false,
                    Credentials = new NetworkCredential(senderEmail, password)
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(senderEmail, senderName),
                    Subject = subject ?? string.Empty,
                    Body = body ?? string.Empty,
                    IsBodyHtml = true
                };
                mailMessage.To.Add(toEmail);

                await client.SendMailAsync(mailMessage);
            }
            catch (SmtpException smtpEx)
            {
                Console.WriteLine("SMTP ERROR: " + smtpEx.ToString());
                throw new InvalidOperationException("Failed to send email via SMTP.", smtpEx);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Email ERROR: " + ex.ToString());
                throw new InvalidOperationException("Email sending failed.", ex);
            }
        }
    }
}
