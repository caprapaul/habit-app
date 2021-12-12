using System.Threading.Tasks;
using backend.DTO;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/users")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly UserService _userService;

        public UsersController(UserService userService)
        {
            _userService = userService;
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult<UserDto>> GetDetailsAsync()
        {
            return await _userService.MeAsync();
        }

        [HttpPost("register")]
        public async Task<ActionResult> RegisterAsync([FromBody] UserForCreateDto registerDto)
        {
            await _userService.RegisterAsync(registerDto);

            return Ok();
        }
        
        [HttpPost("login")]
        public async Task<ActionResult<string>> LoginAsync([FromBody] UserForCreateDto loginDto)
        {
            string token = await _userService.LoginAsync(loginDto);

            return token;
        }
    }
}
