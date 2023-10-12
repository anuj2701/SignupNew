using System.Net;
using System.Net.Mail;

namespace AngularAPI.Services
{
    public class EmailService : IEmailService
    {
        private IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        public void SendEmail(string to,string subject,string body)
        {
            var emailSettings = _configuration.GetSection("EmailSettings");

            using var client = new SmtpClient
            {
                Host = emailSettings["SmtpServer"],
                Port = Convert.ToInt32(emailSettings["SmtpPort"]),
                Credentials = new NetworkCredential(emailSettings["SmtpUsername"], emailSettings["SmtpPassword"]),
                EnableSsl = true

            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(emailSettings["SenderEmail"], emailSettings["SenderName"]),
                Subject = subject,
                Body = body,
                IsBodyHtml = true,
            };

            mailMessage.To.Add(to);

            try
            {
                client.UseDefaultCredentials = false;
                client.Send(mailMessage);
            }
             catch(Exception ex)
            {
                throw ex;
            }
        }

    }
}
