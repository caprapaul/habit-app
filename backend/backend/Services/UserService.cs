using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using backend.Controllers;
using backend.DTO;
using backend.Extensions;
using backend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using JwtRegisteredClaimNames = Microsoft.IdentityModel.JsonWebTokens.JwtRegisteredClaimNames;

namespace backend.Services
{
    public class UserService
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly UserManager<User> _userManager;

        public UserService(UserManager<User> userManager, IHttpContextAccessor httpContextAccessor,
            IConfiguration configuration)
        {
            _userManager = userManager;
            _httpContextAccessor = httpContextAccessor;
            _configuration = configuration;
        }

        public async Task<UserDto> MeAsync()
        {
            string userId = _httpContextAccessor.GetUserId();
            User user = await _userManager.FindByIdAsync(userId);

            return new UserDto
            {
                Email = user.Email
            };
        }

        public async Task<string> LoginAsync(UserForCreateDto loginUserDto)
        {
            User user = await _userManager.FindByEmailAsync(loginUserDto.Email);

            if (user == null)
            {
                return null;
            }

            bool isPasswordCorrect = await _userManager.CheckPasswordAsync(user, loginUserDto.Password);
            if (!isPasswordCorrect)
            {
                return null;
            }

            var authenticationClaims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id),
                new(ClaimTypes.Email, user.Email),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var authenticationSigningKey =
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:Secret"]));

            var token = new JwtSecurityToken(
                _configuration["JWT:ValidIssuer"],
                _configuration["JWT:ValidAudience"],
                expires: DateTime.Now.AddMonths(1),
                claims: authenticationClaims,
                signingCredentials: new SigningCredentials(
                    authenticationSigningKey,
                    SecurityAlgorithms.HmacSha256)
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task RegisterAsync(UserForCreateDto userForCreateDto)
        {
            var user = new User
            {
                UserName = userForCreateDto.Email,
                Email = userForCreateDto.Email
            };

            IdentityResult result = await _userManager.CreateAsync(user, userForCreateDto.Password);

            if (!result.Succeeded)
            {
                IEnumerable<string> errorList = result.Errors.ToList().Select(error => error.Description);
                string formattedErrors = string.Join("\n", errorList);
                throw new ApplicationException(formattedErrors);
            }
        }
    }
}
