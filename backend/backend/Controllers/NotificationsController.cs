using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net;
using System.Net.WebSockets;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace backend.Controllers
{
    [Route("api/notifications")]
    [ApiController]
    public class NotificationsController : ControllerBase
    {
        private readonly NotificationService _notificationService;
        private readonly IConfiguration _configuration;

        public NotificationsController(NotificationService habitService, IConfiguration configuration)
        {
            _notificationService = habitService;
            _configuration = configuration;
        }

        [HttpGet]
        public async Task GetAsync([FromQuery] string token)
        {
            if (!HttpContext.WebSockets.IsWebSocketRequest)
            {
                HttpContext.Response.StatusCode = (int) HttpStatusCode.BadRequest;
                return;
            }

            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                byte[] key = Encoding.ASCII.GetBytes(_configuration["JWT:Secret"]);
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                }, out SecurityToken validatedToken);

                var jwtToken = (JwtSecurityToken) validatedToken;
                string userId = jwtToken.Claims.First(x => x.Type == ClaimTypes.NameIdentifier).Value;
                
                using WebSocket webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();
                await _notificationService.AddSubscriber(userId, webSocket);
                
            }
            catch
            {
                // ignored
            }
        }
    }
}
