using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace backend.Extensions
{
    public static class IHttpContextAccessorExtensions
    {
        public static string GetUserId(this IHttpContextAccessor httpContextAccessor)
        {
            return httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }
    }
}
