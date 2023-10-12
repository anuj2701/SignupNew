using AngularAPI.Context;
using AngularAPI.Helper;
using AngularAPI.Models;
using AngularAPI.Services;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.EntityFrameworkCore.Query.SqlExpressions;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Principal;
using System.Text;
using System.Text.RegularExpressions;

namespace AngularAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly AppDb _authContext;

        private readonly IEmailService _emailService;

        private readonly IMediator _mediator;
        public UserController(AppDb appDbContext, IEmailService emailService,IMediator mediator)
        {
            _authContext = appDbContext;
            _emailService = emailService;
            _mediator = mediator;
        }

        [HttpPost("authenticate")]
        
        public async Task<IActionResult> Authenticate([FromBody] User userObj)
        {
            if (userObj == null)
            {
                return BadRequest();
            }


            var user = await _authContext.Users.FirstOrDefaultAsync(x => x.Email == userObj.Email);

            if (!user.IsActive)
            {
                return NotFound(new { Message = "User is Deactivated" });
            }
            if (user == null)
            {
                return NotFound(new { Message = "User not Found!" });
            }
            if (!PasswordHasher.VerifyPassword(userObj.Password, user.Password))
            {
                return BadRequest(new { Message = "Password is Incorrect" });
            }

            user.Token = CreateJwt(user);
            await _authContext.SaveChangesAsync();

            return Ok(new
            {
                Token = user.Token,
                Message = "Login Success!"
            });
        }


        [HttpPost("register")]

        public async Task<IActionResult> RegisterUser([FromBody] User userObj)
        {
            if (userObj == null)
            {
                return BadRequest();
            }
            if (await CheckEmailExistAsync(userObj.Email))

            {
                return NotFound(new { Message = "User Already Exists!" });
            }

            var pass = CheckPasswordStrength(userObj.Password);
            if (!string.IsNullOrEmpty(pass))
            {
                return NotFound(new { Message = pass.ToString() });
            }
            userObj.Password = PasswordHasher.HashPassword(userObj.Password);
            await _authContext.Users.AddAsync(userObj);
            await _authContext.SaveChangesAsync();
            _emailService.SendEmail(userObj.Email, "Welcome To FusionStak", "Thank you for Registering!");

            return Ok(new
            {
                Message = "User Registered",

            });

        }


        //[HttpPost("register")]

        //public async Task<IActionResult> Register(User createUserModel)
        //    => Ok(await _mediator.Send(createUserModel));


        [HttpPost("adduser")]

        public async Task<IActionResult> AddUser([FromBody] User userObj)
        {
            var logger = ErrorLogger.ConfigureLogger();
            try
            {
                logger.Information("Application Started");
                if (userObj == null)
                {
                    return BadRequest();
                }
                if (await CheckEmailExistAsync(userObj.Email))

                {
                    return NotFound(new { Message = "User Already Exists!" });
                }

                await _authContext.Users.AddAsync(userObj);
                await _authContext.SaveChangesAsync();
                _emailService.SendEmail(userObj.Email, "Welcome To FusionStak", "Thank you for Registering!");


                return Ok(new
                {
                    Message = "User Registered"
                });
            }
            catch (Exception ex)
            {
                logger.Error(ex, "An error occurred.");
                return StatusCode(500, "An error occurred.");
            }
            finally
            {
                Log.CloseAndFlush();
            }

        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateField(int id, User model)
        {
            var entity = await _authContext.Users.FindAsync(id);

            if (entity == null)
            {
                return NotFound();
            }

            // Update the specific field
            entity.IsActive = model.IsActive;

        
                await _authContext.SaveChangesAsync();

            return Ok(new
            {
                Message = "User Data Updated"
            });
        }


        [HttpDelete]

        public async Task<IActionResult> DeleteUser(int id)
        {
            if (_authContext.Users == null)
            {
                return NotFound("User Not Found");
            }
            var user = await _authContext.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound("User not Found");
            }

            _authContext.Users.Remove(user);
            await _authContext.SaveChangesAsync();



            return Ok(new
            {
                Message = "User Deleted"
            });

        }





        [HttpPut]
        public async Task<IActionResult> EditUser( User updatedUser)
        {
            if (updatedUser.Id == 0)
            {
                return BadRequest();
            }
            if (updatedUser==null)
            {
                return BadRequest();
            }
            var pass = CheckPasswordStrength(updatedUser.Password);
            if (!string.IsNullOrEmpty(pass))
            {
                return NotFound(new { Message = pass.ToString() });
            }
            updatedUser.Password = PasswordHasher.HashPassword(updatedUser.Password);
            await _authContext.Users.AddAsync(updatedUser);
            await _authContext.SaveChangesAsync();

            return Ok(new
            {
                Message = "User Data Updated"
            });


        }




        private bool UserExists(int id)
        {
            return _authContext.Users.Any(u => u.Id == id);
        }



        private Task<bool> CheckEmailExistAsync(string email)
        {
            return _authContext.Users.AnyAsync(x => x.Email == email);
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

        private string CreateJwt(User user)
        {
            var jwtTokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes("veryverysecret...");
            var identity = new ClaimsIdentity(new Claim[]
            {   
                new Claim(ClaimTypes.Name,user.Id.ToString()),
                new Claim(ClaimTypes.Name,$"{user.Firstname}{user.LastName}"),
                new Claim(ClaimTypes.Name,user.Role.ToString())
            });

            var credentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = identity,
                Expires = DateTime.Now.AddDays(1),
                SigningCredentials = credentials
            };
            var token = jwtTokenHandler.CreateToken(tokenDescriptor);
            return jwtTokenHandler.WriteToken(token);


        }
       
        [HttpGet]

        public async Task<ActionResult<User>> GetAllUsers(string usertoken)
        {
            var logger = ErrorLogger.ConfigureLogger();
            try
            {
                logger.Information("Application Started");
                ValidateToken(usertoken);
                return Ok(await _authContext.Users.ToListAsync());
            }
          

            catch(Exception ex){

                logger.Error(ex, "An error occurred.");
                return StatusCode(500, "An error occurred.");
            }
            

        }

        [HttpGet("{id}")]
        public ActionResult<User> GetUserById(int id)
        {
            var user = _authContext.Users.FirstOrDefault(u => u.Id == id);
            if (user == null)
            {
                return NotFound(); // Return a 404 response if user is not found
            }
            return Ok(user);
        }

        private static bool ValidateToken(string authToken)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var validationParameters = GetValidationParameters();

            SecurityToken validatedToken;
            IPrincipal principal = tokenHandler.ValidateToken(authToken, validationParameters, out validatedToken);
            return true;
        }

        private static TokenValidationParameters GetValidationParameters()
        {
            return new TokenValidationParameters()
            {
                ValidateLifetime = true, // Because there is no expiration in the generated token
                ValidateAudience = false, // Because there is no audiance in the generated token
                ValidateIssuer = false,   // Because there is no issuer in the generated token
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes("veryverysecret...")) // The same key as the one that generate the token
            };
        }
    
}
}
