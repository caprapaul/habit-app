using System;

namespace backend.Models
{
    public class Note : Entity
    {
        public string Title { get; set; }
        public string Text { get; set; }
        public string Image { get; set; }
        public DateTime AddedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public string UserId { get; set; }
    }
}
