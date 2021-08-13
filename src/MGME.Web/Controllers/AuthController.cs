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
        private readonly IAuthService _authService;

        private readonly IConfiguration _configuration;

        public AuthController(IAuthService authService, IConfiguration configuration)
        {
            _authService = authService;
            _configuration = configuration;
        }

        [HttpPost("Register")]
        public async Task <IActionResult> RegisterUser(RegisterUserDTO request)
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
        public async Task <IActionResult> LoginUser(LoginUserDTO request)
        {
            /*
            Even though we deny login on client side if the user is already logged in
            It never hurts to double check
            */
            bool userLoggedIn = Request.Cookies.ContainsKey("sessionIsActive");

            if (userLoggedIn)
            {
                return BadRequest(
                    new BaseServiceResponse()
                    {
                        Success = false,
                        Message = "User already logged in"
                    }
                );
            }

            DataServiceResponse<UserTokensDTO> response =  await _authService.LoginUser(
                request.Name,
                request.Password
            );

            if (response.Success)
            {
                AddSessionCookie();

                WriteRefreshTokenToCookie(response.Data.RefreshToken);

                return Ok(response);
            }

            // User name or password is incorrect
            return BadRequest(response);
        }

        [HttpGet("Logout")]
        public async Task <IActionResult> LogoutUser()
        {
            BaseServiceResponse response = new BaseServiceResponse();

            bool userLoggedIn = Request.Cookies.ContainsKey("sessionIsActive");

            if (!userLoggedIn)
            {
                response.Success = false;
                response.Message = "User is not logged in";

                return BadRequest(response);
            }

            string refreshToken = Request.Cookies["refreshToken"];

            if (refreshToken == null)
            {
                response.Success = false;
                response.Message = "Refresh token is missing";

                return Unauthorized(response);
            }

            response = await _authService.LogoutUser(refreshToken);

            if (response.Success)
            {
                Response.Cookies.Delete("sessionIsActive");
                Response.Cookies.Delete("refreshToken");

                response.Success = true;

                return Ok(response);
            }

            // Provided token is missing from db
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
            bool userLoggedIn = Request.Cookies.ContainsKey("sessionIsActive");

            if (!userLoggedIn)
            {
                return BadRequest(
                    new BaseServiceResponse()
                    {
                        Success = false,
                        Message = "Session has ended"
                    }
                );
            }

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

        /*
        NOTE: we don't use refresh token itself for session management, since
        we rotate both refresh and access tokens every time access token is expired

        And in such, refresh token is constantly updated; although we still give it
        an expiration, so it will be removed when session ends
        */
        private void WriteRefreshTokenToCookie(string token)
        {
            // Secure = true is not needed, as this is not production project
            Response.Cookies.Append("refreshToken", token, new CookieOptions()
            {
                HttpOnly = true,
                Expires = DateTime.UtcNow.AddHours(
                    Convert.ToInt32(_configuration["TokensLifetime:RefreshTokenHours"])
                )
            });
        }

        // Instead of refresh token, we use simple flag to imitate sessions
        private void AddSessionCookie()
        {
            // Secure = true is not needed, as this is not production project
            Response.Cookies.Append("sessionIsActive", true.ToString(), new CookieOptions()
            {
                HttpOnly = true,
                Expires = DateTime.UtcNow.AddHours(
                    Convert.ToInt32(_configuration["TokensLifetime:RefreshTokenHours"])
                )
            });
        }
    }
}