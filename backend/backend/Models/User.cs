using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace backend.Models
{
    public class User : IdentityUser
    {
        public virtual List<Note> Notes { get; set; } = new();
    }
}
