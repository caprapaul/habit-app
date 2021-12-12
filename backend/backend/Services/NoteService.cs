using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTO;
using backend.Extensions;
using backend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class NoteService
    {
        private readonly DataContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly UserManager<User> _userManager;

        public NoteService(DataContext context, IHttpContextAccessor httpContextAccessor, UserManager<User> userManager)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _userManager = userManager;
        }

        public async Task<Note> CreateAsync(NoteForCreateDto addNoteDto)
        {
            string userId = _httpContextAccessor.GetUserId();
            var note = new Note
            {
                Title = addNoteDto.Title,
                Text = addNoteDto.Text,
                AddedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                UserId = userId
            };

            await _context.Notes.AddAsync(note);
            await _context.SaveChangesAsync();

            return note;
        }
        
        public async Task<List<Note>> FindAsync()
        {
            string userId = _httpContextAccessor.GetUserId();

            return await _context.Notes.Where(n => n.UserId == userId)
                .OrderBy(n => n.UpdatedAt)
                .ToListAsync();
        }

        public async Task<List<Note>> FindAsync(int offset, int count, string searchText)
        {
            string userId = _httpContextAccessor.GetUserId();

            IQueryable<Note> notes;

            if (string.IsNullOrEmpty(searchText))
            {
                notes = _context.Notes.Where(n => n.UserId == userId);
            }
            else
            {
                searchText = searchText.ToUpper();
                notes = _context.Notes.Where(n => n.UserId == userId &&
                                                  (n.Text.ToUpper()
                                                       .Contains(searchText) ||
                                                   n.Title.ToUpper()
                                                       .Contains(searchText)));
            }
            
            return await notes.OrderByDescending(n => n.UpdatedAt)
                .Skip(offset)
                .Take(count)
                .ToListAsync();
        }

        public async Task<Note> GetAsync(Guid id)
        {
            return await _context.Notes.FindAsync(id);
        }

        public async Task<Note> UpdateAsync(NoteDto updateNoteDto)
        {
            Note note = await _context.Notes.FindAsync(updateNoteDto.Id);

            note.Title = updateNoteDto.Title;
            note.Text = updateNoteDto.Text;
            note.UpdatedAt = DateTime.UtcNow;
            note.Image = updateNoteDto.Image;

            await _context.SaveChangesAsync();
            return note;
        }
    }
}
