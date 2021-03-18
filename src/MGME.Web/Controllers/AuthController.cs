using System;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Mvc;

using MGME.Core.DTOs;
using MGME.Core.DTOs.User;
using MGME.Core.Interfaces.Services;

using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace MGME.Web.Controllers
{
    public class AuthController : BaseAPIController
    {
        private IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

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
            DataServiceResponse<string> response =  await _authService.LoginUser(
                request.Name,
                request.Password
            );

            if (response.Success)
            {
                return Ok(response);
            }

            // User name or password is incorrect
            return BadRequest(response);
        }

        [HttpGet("Confirm")]
        public async Task <IActionResult> ConfirmEmailAddress([BindRequired, FromQuery] string token)
        {
            Console.WriteLine(token);

            return Ok("Parse and confirm token here");
        }
    }
}