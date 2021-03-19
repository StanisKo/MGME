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
        private readonly IAuthRepository _authRepository;

        private readonly IEntityRepository<User> _userRepository;

        private readonly IConfiguration _configuration;

        private readonly SymmetricSecurityKey _key;

        private readonly JwtSecurityTokenHandler _tokenHandler;

        private readonly string _hostURL;

        public AuthService(IAuthRepository authRepository,
                           IEntityRepository<User> userRepository,
                           IConfiguration configuration,
                           IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _authRepository = authRepository;
            _userRepository = userRepository;

            _configuration = configuration;

            _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWTKey"]));

            _tokenHandler = new JwtSecurityTokenHandler();

            _hostURL = $"{httpContextAccessor.HttpContext.Request.Scheme}://{httpContextAccessor.HttpContext.Request.Host}/confirm-email";
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
                    response.Message = $"Username is already taken";

                    return response;
                }

                bool emailIsTaken = await _authRepository.CheckIfUserExistsAsync(email, nameof(User.Email));

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

        /*
        TODO:

        Validate Audience and Authority and, of course, lifetime -- add them all to claims
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
                        ValidateIssuer = false,
                        ValidateAudience = false,
                        IssuerSigningKey = _key
                    },
                    out SecurityToken validatedToken);

                // Even if token is valid, still run it againt the database
                JwtSecurityToken securityToken = _tokenHandler.ReadToken(token) as JwtSecurityToken;

                /*
                Can't read the claim here:

                https://stackoverflow.com/questions/64136424/net-core-jwt-decrypt-token-claims-first-returns-sequence-contains-no-ma
                */
                string userName = securityToken.Claims
                    .FirstOrDefault(claim => claim.Type == ClaimTypes.Name)?.Value;

                // If all good, confirm email and respond with success
                User userToConfirmEmail = await _authRepository.RetrieveUserByNameAsync(userName);

                userToConfirmEmail.EmailIsConfirmed = true;

                await _userRepository.UpdateEntityAsync(
                    userToConfirmEmail,
                    new[] { nameof(User.EmailIsConfirmed) }
                );

                response.Success = true;
                response.Message = "Your email was successfully confirmed";

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

        private async void SendConfirmationEmail(User user)
        {
            MimeMessage confirmationMessage = new MimeMessage();

            MailboxAddress fromAddress = new MailboxAddress("MGME", _configuration["EmailConfiguration:From"]);

            MailboxAddress toAddress = new MailboxAddress("User",user.Email);

            confirmationMessage.From.Add(fromAddress);
            confirmationMessage.To.Add(toAddress);
            confirmationMessage.Subject = "Confirm your email at MGME";

            string confirmationToken = CreateToken(
                user,
                Convert.ToInt16(_configuration["ConfirmationTokenLifetime"])
            );

            string confirmationURL = QueryHelpers.AddQueryString(
                _hostURL,
                new Dictionary<string, string>() { { "token", confirmationToken } }
            );

            BodyBuilder bodyBuilder = new BodyBuilder();

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
        }
    }
}