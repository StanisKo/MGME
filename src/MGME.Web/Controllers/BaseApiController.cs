using System.Net.Mime;

using Microsoft.AspNetCore.Mvc;

namespace MGME.Web.Controllers
{
    [ApiController]
    [ApiVersion("1.0")]
    [Produces(MediaTypeNames.Application.Json)]
    [Route("api/v{version:apiVersion}/[controller]")]
    public abstract class BaseAPIController : ControllerBase
    {
        
    }
}