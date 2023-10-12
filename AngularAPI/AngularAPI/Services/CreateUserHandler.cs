using AngularAPI.Context;
using AngularAPI.Helper;
using AngularAPI.Models;
using MediatR;
using Microsoft.AspNetCore.Identity;
using System.Text.RegularExpressions;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AngularAPI.Services
{
    public class CreateUserHandler : IRequestHandler<User, IdentityResult>
    {
        private readonly AppDb _authContext;

        //private readonly IEmailService _emailService;

        //private readonly UserManager<User> _userManager;

        public CreateUserHandler(AppDb appDbContext//, IEmailService emailService, UserManager<User> userManager
            )
        {
            _authContext = appDbContext;
           // _emailService = emailService;
           // _userManager= userManager;
        }
        public async Task<IdentityResult> Handle(User model, CancellationToken token)

        {
            if (await CheckEmailExistAsync(model.Email))

            {
                var error = new IdentityError
                {
                    Code = "CheckEmail",
                    Description = "User Already Exists!"
                };

                var result = IdentityResult.Failed(error);

                return result;
            }
            var pass = CheckPasswordStrength(model.Password);

            if (!string.IsNullOrEmpty(pass))
            {
                var error = new IdentityError
                {
                    Code = "PasswordStrength",
                    Description = pass.ToString()
                };

                var result = IdentityResult.Failed(error);

                return result;
            }

            model.Password = PasswordHasher.HashPassword(model.Password);
            // _emailService.SendEmail(model.Email, "Welcome To FusionStak", "Thank you for Registering!");

             await _authContext.Users.AddAsync(model);
             await _authContext.SaveChangesAsync();
            return null;
        }


        private string CheckPasswordStrength(string password)
        {
            StringBuilder sb = new StringBuilder();
            if (password.Length < 8)
            {
                sb.Append("Minimum password length should be 8" + Environment.NewLine);

            }
            if (!(Regex.IsMatch(password, "[a-z]") && Regex.IsMatch(password, "[A-Z]")
               && Regex.IsMatch(password, "[0-9]")))
                sb.Append("Password should be Alphanumeric" + Environment.NewLine);
            if (!Regex.IsMatch(password, "[<,>,@,!,#,$,%,^,&,*,(,),_,+,\\[,\\],{,},?,:,;,|,',\\,.,/,~,`,-,=]"))
                sb.Append("Password should contain special characters" + Environment.NewLine);
            return sb.ToString();
        }
        private Task<bool> CheckEmailExistAsync(string email)
        {
            return _authContext.Users.AnyAsync(x => x.Email == email);
        }
    }
}
