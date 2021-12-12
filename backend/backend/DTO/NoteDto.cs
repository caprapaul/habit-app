using System;

namespace backend.DTO
{
    public class NoteDto : NoteForCreateDto
    {
        public Guid Id { get; set; }
    }
}
