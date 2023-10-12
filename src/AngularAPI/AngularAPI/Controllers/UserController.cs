using AngularAPI.Context;
using AngularAPI.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query.SqlExpressions;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;

namespace AngularAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly AppDb _authContext;
        public UserController(AppDb appDbContext)
        {
            _authContext = appDbContext;
        }

        [HttpPost("authenticate")]

        public async Task<IActionResult> Authenticate([FromBody] User userObj)
        {
            if (userObj == null)
            {
                return BadRequest();
            }


            var user = await _authContext.Users.FirstOrDefaultAsync(x => x.Email == userObj.Email && x.Password == userObj.Password);
            if (user == null)
            {
                return NotFound(new { Message = "User not Found!" });
            }
            user.Token = CreateJwt(user);
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

            await _authContext.Users.AddAsync(userObj);
            await _authContext.SaveChangesAsync();


            return Ok(new
            {
                Message = "User Registered"
            });

        }

        [HttpPost("adduser")]

        public async Task<IActionResult> AddUser([FromBody] User userObj)
        {
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


            return Ok(new
            {
                Message = "User Registered"
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

        [HttpPut("{id}")]
        public async Task<IActionResult> EditUser(int id, User updatedUser)
        {
            if (id != updatedUser.Id)
            {
                return BadRequest();
            }
            if (!UserExists(id))
            {
                return NotFound();
            }

            _authContext.Entry(updatedUser).State = EntityState.Modified;
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
                new Claim(ClaimTypes.Name,$"{user.Firstname}{user.LastName}")
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
        public async Task<ActionResult<User>> GetAllUsers()
        {
            return Ok(await _authContext.Users.ToListAsync());
        }
    }
}
