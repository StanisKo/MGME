using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Security.Claims;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.IdentityModel.Tokens.Jwt;

using MimeKit;
using MailKit.Net.Smtp;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;

using MGME.Core.DTOs;
using MGME.Core.Entities;
using MGME.Core.Interfaces.Services;
using MGME.Core.Interfaces.Repositories;

namespace MGME.Core.Services.Auth
{
    public class AuthService : BaseEntityService, IAuthService
    {
        private readonly IAuthRepository _repository;

        private readonly IConfiguration _configuration;

        private readonly SymmetricSecurityKey _key;

        private readonly JwtSecurityTokenHandler _tokenHandler;

        public AuthService(IAuthRepository repository,
                           IConfiguration configuration,
                           IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _repository = repository;
            _configuration = configuration;

            _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWTKey"]));

            _tokenHandler = new JwtSecurityTokenHandler();
        }

        public async Task <BaseServiceResponse> RegisterUser(string name, string email, string password)
        {
            BaseServiceResponse response = new BaseServiceResponse();

            try
            {
                bool userNameIsTaken = await _repository.CheckIfUserExistsAsync(name, nameof(User.Name));

                if (userNameIsTaken)
                {
                    response.Success = false;
                    response.Message = $"Username is already taken";

                    return response;
                }

                bool emailIsTaken = await _repository.CheckIfUserExistsAsync(email, nameof(User.Email));

                if (emailIsTaken)
                {
                    response.Success = false;
                    response.Message = $"Email is already taken";

                    return response;
                }

                CreatePasswordHash(password, out byte[] passwordHash, out byte[] passwordSalt);

                User userToRegister = new User()
                {
                    Name = name,
                    Email = email,
                    PasswordHash = passwordHash,
                    PasswordSalt = passwordSalt
                };

                await _repository.RegisterUserAsync(userToRegister);

                /*
                We also send confirmation email with a link
                that includes JWT of user claims
                */

                MimeMessage confirmationMessage = new MimeMessage();

                MailboxAddress fromAddress = new MailboxAddress(
                    "MGME",
                    _configuration["EmailConfiguration:From"]
                );

                MailboxAddress toAddress = new MailboxAddress(
                    "User",
                    userToRegister.Email
                );

                confirmationMessage.From.Add(fromAddress);
                confirmationMessage.To.Add(toAddress);
                confirmationMessage.Subject = "Confirm your email at MGME";

                /*
                TODO:

                De-hardcode the path back to client?
                */
                string hostURL =
                    $"{_httpContextAccessor.HttpContext.Request.Scheme}://{_httpContextAccessor.HttpContext.Request.Host}/confirm-email";

                string confirmationToken = CreateToken(
                    userToRegister,
                    Convert.ToInt16(_configuration["ConfirmationTokenLifetime"])
                );

                string confirmationURL = QueryHelpers.AddQueryString(
                    hostURL,
                    new Dictionary<string, string>() { { "token", confirmationToken } }
                );

                BodyBuilder bodyBuilder = new BodyBuilder();

                /*
                TODO:

                Use template
                */
                bodyBuilder.HtmlBody = $@"
                <h1>Welcome to MGME!</h1>
                <br/>
                <p>Please confirm your email by following this link:</p>
                <br/>
                <p>{confirmationURL}</p>";

                confirmationMessage.Body = bodyBuilder.ToMessageBody();

                SmtpClient smptClient = new SmtpClient();

                smptClient.Connect(
                    _configuration["EmailConfiguration:SmtpServer"],
                    Convert.ToInt16(_configuration["EmailConfiguration:Port"]),
                    true
                );

                smptClient.Authenticate(
                    _configuration["EmailConfiguration:From"],
                    _configuration["EmailSenderPassword"]
                );

                await smptClient.SendAsync(confirmationMessage);
                await smptClient.DisconnectAsync(true);

                smptClient.Dispose();

                response.Success = true;
                response.Message = "You were successfully registered! Please check your email to verify the account";
            }
            catch (Exception exception)
            {
                response.Success = false;
                response.Message = exception.Message;
            }

            return response;
        }

        public async Task <DataServiceResponse<string>> LoginUser(string name, string password)
        {
            DataServiceResponse<string> response = new DataServiceResponse<string>();

            try
            {
                User userToLogin = await _repository.RetrieveUserByNameAsync(name);

                if (userToLogin == null)
                {
                    response.Success = false;
                    response.Message = "Either username or password is wrong";
                }
                else if (!VerifyPasswordHash(password, userToLogin.PasswordHash, userToLogin.PasswordSalt))
                {
                    response.Success = false;
                    response.Message = "Either username or password is wrong";
                }
                else if (!userToLogin.EmailIsConfirmed)
                {
                    response.Success = false;
                    response.Message = "You need to confirm your email before you can sign in";
                }
                else
                {
                    response.Data = CreateToken(
                        userToLogin,
                        Convert.ToInt16(_configuration["SessionLifetime"])
                    );

                    response.Success = true;
                    response.Message = "User logged in";
                }
            }
            catch (Exception exception)
            {
                response.Success = false;
                response.Message = exception.Message;
            }

            return response;
        }

        /*
        TODO:

        Validate Audience and Authority
        */
        public async Task <BaseServiceResponse> ConfirmEmailAddress(string token)
        {
            BaseServiceResponse response = new BaseServiceResponse();

            try
            {
                _tokenHandler.ValidateToken(
                    token,
                    new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        ValidateLifetime = true,
                        IssuerSigningKey = _key
                    },
                    out SecurityToken validatedToken);

                /*
                Even if token is valid, still run it againt the database
                */
                JwtSecurityToken securityToken = _tokenHandler.ReadToken(token) as JwtSecurityToken;

                string userName = securityToken.Claims.First(claim => claim.Type == ClaimTypes.Name).Value;

                bool userExists = await _repository.CheckIfUserExistsAsync(userName, nameof(User.Name));

                if (!userExists)
                {
                    response.Success = false;
                    response.Message = "Unfortunately we were not able to confirm your email address";

                    return response;
                }

                // If all good, confirm email and respond with success
                User userToConfirmEmail = await _repository.RetrieveUserByNameAsync(userName);

                userToConfirmEmail.EmailIsConfirmed = true;

                

            }
            catch (Exception exception)
            {
                response.Success = false;
                response.Message = exception.Message;
            }

            return response;
        }

        private void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using (HMACSHA512 hmac = new HMACSHA512())
            {
                passwordSalt = hmac.Key;
                passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
            }
        }

        private bool VerifyPasswordHash(string password, byte[] passwordHash, byte[] passwordSalt)
        {
            using (HMACSHA512 hmac = new HMACSHA512(passwordSalt))
            {
                byte[] computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));

                // Compare hash with the hash from db byte-by-byte
                for (int i = 0; i < computedHash.Length; i++)
                {
                    if (computedHash[i] != passwordHash[i])
                    {
                        return false;
                    }
                }

                return true;
            }
        }

        private string CreateToken(User user, int expiresInHours)
        {
            List<Claim> claims = new List<Claim>()
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Role, user.Role)
            };

            SigningCredentials credentials = new SigningCredentials(
                _key,
                SecurityAlgorithms.HmacSha512Signature
            );

            SecurityTokenDescriptor tokenDescriptor = new SecurityTokenDescriptor()
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddHours(expiresInHours),
                SigningCredentials = credentials
            };

            SecurityToken securityToken = _tokenHandler.CreateToken(tokenDescriptor);

            return _tokenHandler.WriteToken(securityToken);
        }
    }
}