using System;
using System.IO;
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
using Microsoft.AspNetCore.Hosting;
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
        private readonly IAuthRepository _authRepository;

        private readonly IEntityRepository<User> _userRepository;

        private readonly IConfiguration _configuration;

        private readonly IWebHostEnvironment _environment;

        private readonly JwtSecurityTokenHandler _tokenHandler;

        private readonly SymmetricSecurityKey _securityKey;

        public AuthService(IAuthRepository authRepository,
                           IEntityRepository<User> userRepository,
                           IConfiguration configuration,
                           IWebHostEnvironment environment,
                           IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _authRepository = authRepository;
            _userRepository = userRepository;

            _configuration = configuration;
            _environment = environment;

            _tokenHandler = new JwtSecurityTokenHandler();

            _securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWTKey"]));
        }

        public async Task <BaseServiceResponse> RegisterUser(string name, string email, string password)
        {
            BaseServiceResponse response = new BaseServiceResponse();

            try
            {
                bool userNameIsTaken = await _authRepository.CheckIfUserExistsAsync(name, nameof(User.Name));

                if (userNameIsTaken)
                {
                    response.Success = false;
                    response.Message = "Username is already taken";

                    return response;
                }

                bool emailIsTaken = await _authRepository.CheckIfUserExistsAsync(email, nameof(User.Email));

                if (emailIsTaken)
                {
                    response.Success = false;
                    response.Message = "Email is already taken";

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

                await _authRepository.RegisterUserAsync(userToRegister);

                SendConfirmationEmail(userToRegister);

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
                User userToLogin = await _authRepository.RetrieveUserByNameAsync(name);

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

        public async Task <BaseServiceResponse> ConfirmEmailAddress(string token)
        {
            BaseServiceResponse response = new BaseServiceResponse();

            JwtSecurityToken securityToken = _tokenHandler.ReadToken(token) as JwtSecurityToken;

            // Somehow claim.Type == ClaimTypes.Name returns null ...
            int userId = Convert.ToInt16(
                securityToken.Claims.FirstOrDefault(claim => claim.Type == "nameid")?.Value
            );

            try
            {
                /*
                We set clockskew to zero so tokens expire
                exactly at token expiration time (instead of 5 minutes later)
                */
                _tokenHandler.ValidateToken(
                    token,
                    new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = _securityKey,

                        ValidateIssuer = true,
                        ValidIssuer = _configuration["Host"],

                        ValidateAudience = true,
                        ValidAudience = _configuration["Host"],

                        ValidateLifetime = true,
                        ClockSkew = TimeSpan.Zero
                    },
                    out SecurityToken validatedToken
                );

                User userToConfirmEmail = await _userRepository.GetEntityAsync(userId);

                if (userToConfirmEmail.EmailIsConfirmed)
                {
                    response.Success = false;
                    response.Message = "Your email is already confirmed";

                    return response;
                }

                userToConfirmEmail.EmailIsConfirmed = true;

                await _userRepository.UpdateEntityAsync(
                    userToConfirmEmail,
                    new[] { nameof(User.EmailIsConfirmed) }
                );

                response.Success = true;
                response.Message = "Your email was successfully confirmed";
            }
            catch (SecurityTokenExpiredException exception)
            {
                _ = exception;

                User userToResendEmail = await _userRepository.GetEntityAsync(userId);

                /*
                Just in case if user revisits confirmation link after it expired
                and after the email was already confirmed
                */
                if (userToResendEmail.EmailIsConfirmed)
                {
                    response.Success = false;
                    response.Message = "Your email is already confirmed";

                    return response;
                }

                // Otherwise we send new confirmation link
                SendConfirmationEmail(userToResendEmail);

                response.Success = false;
                response.Message = "Your confirmation link has expired. We've sent you another email";

                return response;
            }
            catch (Exception exception)
            {
                // Otherwise it's issuer/audience/signature exception or database exception
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
                _securityKey,
                SecurityAlgorithms.HmacSha512Signature
            );

            SecurityTokenDescriptor tokenDescriptor = new SecurityTokenDescriptor()
            {
                Subject = new ClaimsIdentity(claims),
                Issuer = _configuration["Host"],
                Audience = _configuration["Host"],
                Expires = DateTime.UtcNow.AddHours(expiresInHours),
                SigningCredentials = credentials
            };

            SecurityToken securityToken = _tokenHandler.CreateToken(tokenDescriptor);

            return _tokenHandler.WriteToken(securityToken);
        }

        private async void SendConfirmationEmail(User user)
        {
            MimeMessage confirmationMessage = new MimeMessage();

            MailboxAddress toAddress = new MailboxAddress("User", user.Email);

            MailboxAddress fromAddress = new MailboxAddress("MGME", _configuration["EmailConfiguration:From"]);

            confirmationMessage.To.Add(toAddress);

            confirmationMessage.From.Add(fromAddress);

            confirmationMessage.Subject = "Confirm your email at MGME";

            /*
            Create token and add it as a querystring param to callback url
            that leads back to the client app
            Token is then parsed by the client side and relayed to ConfirmEmailAddress method
            */
            string confirmationToken = CreateToken(
                user,
                Convert.ToInt16(_configuration["ConfirmationTokenLifetime"])
            );

            string clientCallbackURL = _httpContextAccessor.HttpContext.Request.Scheme
                                       + "://"
                                       + _httpContextAccessor.HttpContext.Request.Host
                                       + "/confirm-email";

            string confirmationURL = QueryHelpers.AddQueryString(
                clientCallbackURL,
                new Dictionary<string, string>() { { "token", confirmationToken } }
            );

            // We also use a custom template stored under ../../MGME.Web/wwwroot
            string pathToEmailTemplate = _environment.WebRootPath
                                         + Path.DirectorySeparatorChar.ToString()
                                         + "Templates"
                                         + Path.DirectorySeparatorChar.ToString()
                                         + "ConfirmEmail.html";

            string template = null;

            using (StreamReader SourceReader = File.OpenText(pathToEmailTemplate))
            {
                template = SourceReader.ReadToEnd();
            }

            BodyBuilder bodyBuilder = new BodyBuilder();

            /*
            We avoid formatting the template, since it contains other source of {} brackets
            and use replace to insert the link
            We also don't use Razor since it's a simple job
            */
            bodyBuilder.HtmlBody = template.Replace("confirmation-url", confirmationURL);

            confirmationMessage.Body = bodyBuilder.ToMessageBody();

            using (SmtpClient smtpClient = new SmtpClient())
            {
                smtpClient.Connect(
                    _configuration["EmailConfiguration:SmtpServer"],
                    Convert.ToInt16(_configuration["EmailConfiguration:Port"]),
                    true
                );

                smtpClient.Authenticate(
                    _configuration["EmailConfiguration:From"],
                    _configuration["EmailSenderPassword"]
                );

                await smtpClient.SendAsync(confirmationMessage);

                await smtpClient.DisconnectAsync(true);
            }
        }
    }
}
