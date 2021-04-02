using System.Threading.Tasks;

using Microsoft.AspNetCore.Mvc;

using MGME.Core.DTOs;
using MGME.Core.DTOs.User;
using MGME.Core.Interfaces.Services;

using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace MGME.Web.Controllers
{
    [Authorize(Roles = "GameMaster,Admin")]
    public class UserController : BaseAPIController
    {

        private readonly IUserService _userService;

        private IConfiguration _configuration;

        public UserController(IUserService userService, IConfiguration configuration)
        {
            _userService = userService;
            _configuration = configuration;
        }

        [HttpGet]
        public async Task <IActionResult> GetUser()
        {
            DataServiceResponse<GetUserDTO> response = await _userService.GetUser();

            if (response.Success)
            {
                return Ok(response);
            }

            return NotFound(response);
        }
    }
}