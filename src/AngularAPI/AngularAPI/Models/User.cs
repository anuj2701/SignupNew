using System.ComponentModel.DataAnnotations;

namespace AngularAPI.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }
            
        public string Firstname { get; set; }
        public string LastName { get; set; }

        public string CompanyName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Industry { get; set; }
        

        public string Token { get; set; }
    }
}
