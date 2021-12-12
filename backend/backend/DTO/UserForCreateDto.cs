using System.ComponentModel.DataAnnotations;

namespace backend.DTO
{
    public class UserForCreateDto
    {
        [EmailAddress]
        public string Email { get; set; }

        public string Password { get; set; }
    }
}
