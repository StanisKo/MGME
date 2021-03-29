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
            /*
            Even though we deny login on client side if the user is already logged in
            It never hurts to double check
            */
            bool userLoggedIn = Request.Cookies.ContainsKey("refreshToken");

            // Even though we hide route on the client side, it never hurts to double check
            if (userLoggedIn)
            {
                return BadRequest(
                    new BaseServiceResponse()
                    {
                        Success = false,
                        Message = "You are already logged in"
                    }
                );
            }

            DataServiceResponse<UserTokensDTO> response =  await _authService.LoginUser(
                request.Name,
                request.Password
            );

            if (response.Success)
            {
                WriteRefreshTokenToCookie(response.Data.RefreshToken);

                return Ok(response);
            }

            // User name or password is incorrect
            return BadRequest(response);
        }

        [HttpPost("Confirm")]
        public async Task <IActionResult> ConfirmEmailAddress(UserConifrmationTokenDTO request)
        {
            BaseServiceResponse response = await _authService.ConfirmEmailAddress(request.Token);

            if (response.Success)
            {
                return Ok(response);
            }

            // Confirmation is invalid
            return BadRequest(response);
        }

        /*
        We use GET since we avoid any kind of payload
        and access refresh token from httpOnly cookie
        */
        [HttpGet("Refresh-Token")]
        public async Task <IActionResult> RefreshToken()
        {
            string refreshToken = Request.Cookies["refreshToken"];

            if (refreshToken == null)
            {
                return Unauthorized(
                    new BaseServiceResponse()
                    {
                        Success = false,
                        Message = "Refresh token is missing"
                    }
                );
            }

            DataServiceResponse<UserTokensDTO> response =  await _authService.RefreshAccessToken(
                refreshToken
            );

            if (response.Success)
            {
                WriteRefreshTokenToCookie(response.Data.RefreshToken);

                return Ok(response);
            }

            // Refresh token is invalid
            return BadRequest(response);
        }

        private void WriteRefreshTokenToCookie(string token)
        {
            /*
            Even though we are checking token expiration against the one in the database,
            we also add expiration to token cookie itself
            */
            Response.Cookies.Append("refreshToken", token, new CookieOptions()
            {
                HttpOnly = true,
                Secure = true,
                Expires = DateTime.UtcNow.AddHours(
                    Convert.ToInt16(_configuration["TokensLifetime:RefreshTokenHours"])
                )
            });
        }
    }
}