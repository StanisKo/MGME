using System.Threading.Tasks;

using Microsoft.AspNetCore.Mvc;

using MGME.Core.DTOs;
using MGME.Core.DTOs.User;
using MGME.Core.Interfaces.Services;

using Microsoft.AspNetCore.Authorization;

namespace MGME.Web.Controllers
{
    [Authorize(Roles = "GameMaster,Admin")]
    public class UserController : BaseAPIController
    {

        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task <IActionResult> GetUser()
        {
            DataServiceResponse<GetOrUpdateUserDTO> response = await _userService.GetUser();

            if (response.Success)
            {
                return Ok(response);
            }

            return NotFound(response);
        }

        [HttpPut("Update")]
        public async Task <IActionResult> UpdateUser(GetOrUpdateUserDTO updatedUser)
        {
            BaseServiceResponse response = await _userService.UpdateUser(updatedUser);

            if (response.Success)
            {
                return Ok(response);
            }

            return NotFound(response);
        }

        [HttpPut("Change-Password")]
        public async Task <IActionResult> ChangeUserPassword(ChangeUserPasswordDTO passwords)
        {
            BaseServiceResponse response = await _userService.ChangeUserPassword(passwords);

            if (response.Success)
            {
                return Ok(response);
            }

            // Can also be bad request if user not found
            return NotFound(response);
        }

        [HttpDelete("Delete")]
        public async Task <IActionResult> DeleteUser()
        {
            BaseServiceResponse response = await _userService.DeleteUser();

            // We also remove refresh token and session flag, so the user is logged out
            if (response.Success)
            {
                Response.Cookies.Delete("sessionIsActive");
                Response.Cookies.Delete("refreshToken");

                return Ok(response);
            }

            return NotFound(response);
        }
    }
}