using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.DTO;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Authorize]
    [Route("api/notes")]
    [ApiController]
    public class NotesController : ControllerBase
    {
        private readonly NoteService _noteService;
        private readonly NotificationService _notificationService;

        public NotesController(NoteService noteService, NotificationService notificationService)
        {
            _noteService = noteService;
            _notificationService = notificationService;
        }

        // GET: api/notes?page=0
        [HttpGet]
        public async Task<ActionResult<List<Note>>> GetAsync([FromQuery] int? offset, [FromQuery] int? count, [FromQuery] string searchText)
        {
            List<Note> habits;
            
            if (offset == null || count == null)
            {
                habits = await _noteService.FindAsync();
            }
            else
            {
                habits = await _noteService.FindAsync(offset.Value, count.Value, searchText);
            }
            
            return habits;
        }

        // GET: api/notes/2
        [HttpGet("{id:guid}")]
        public async Task<ActionResult<Note>> GetDetailsAsync([FromRoute] Guid id)
        {
            Note note = await _noteService.GetAsync(id);
            return note;
        }

        // POST: api/notes
        [HttpPost]
        public async Task<ActionResult> AddAsync([FromBody] NoteForCreateDto noteForCreateDto)
        {
            Note note = await _noteService.CreateAsync(noteForCreateDto);

            var notification = new Notification
            {
                Event = Notification.Events.Created,
                Payload = new NotificationPayload
                {
                    Item = note
                }
            };

            await _notificationService.SendNotificationAsync(notification);

            return Created($"api/habits/{note.Id}", note);
        }

        // PUT: api/notes/2
        [HttpPut]
        public async Task<ActionResult> UpdateAsync([FromBody] NoteDto noteDto)
        {
            Note note = await _noteService.UpdateAsync(noteDto);

            var notification = new Notification
            {
                Event = Notification.Events.Updated,
                Payload = new NotificationPayload
                {
                    Item = note
                }
            };

            await _notificationService.SendNotificationAsync(notification);

            return Ok();
        }
    }
}
