using System;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;

using MGME.Core.DTOs;
using MGME.Core.DTOs.User;
using MGME.Core.Interfaces.Services;

using Microsoft.Extensions.Configuration;

namespace MGME.Web.Controllers
{
    public class AuthController : BaseAPIController
    {
        private IAuthService _authService;

        private IConfiguration _configuration;

        public AuthController(IAuthService authService, IConfiguration configuration)
        {
            _authService = authService;
            _configuration = configuration;
        }

        // Pass DTOs instead of values to avoid copyign them
        [HttpPost("Register")]
        public async Task <IActionResult> RegisterUser(UserRegisterDTO request)
        {
            BaseServiceResponse response =  await _authService.RegisterUser(
                request.Name,
                request.Email,
                request.Password
            );

            if (response.Success)
            {
                return Ok(response);
            }

            // User already exists
            return BadRequest(response);
        }

        [HttpPost("Login")]
        public async Task <IActionResult> LoginUser(UserLoginDTO request)
        {
            DataServiceResponse<UserLoginResponseDTO> response =  await _authService.LoginUser(
                request.Name,
                request.Password
            );

            if (response.Success)
            {
                Response.Cookies.Append("refreshToken", response.Data.RefreshToken, new CookieOptions()
                {
                    HttpOnly = true,
                    Secure = true,
                    Expires = DateTime.UtcNow.AddHours(
                        Convert.ToInt16(_configuration["TokensLifetime:RefreshTokenHours"])
                    )
                });

                return Ok(response);
            }

            // User name or password is incorrect
            return BadRequest(response);
        }

        [HttpPost("Confirm")]
        public async Task <IActionResult> ConfirmEmailAddress(UserConfirmEmailDTO request)
        {
            BaseServiceResponse response = await _authService.ConfirmEmailAddress(request.Token);

            if (response.Success)
            {
                return Ok(response);
            }

            // Token is invalid
            return BadRequest(response);
        }
    }
}