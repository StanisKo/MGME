using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Security.Claims;
using System.Linq.Expressions;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.IdentityModel.Tokens.Jwt;

using AutoMapper;
using MimeKit;
using MailKit.Net.Smtp;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;

using MGME.Core.DTOs;
using MGME.Core.DTOs.User;
using MGME.Core.Entities;
using MGME.Core.Interfaces.Services;
using MGME.Core.Interfaces.Repositories;

namespace MGME.Core.Services.Auth
{
    public class AuthService : BaseEntityService, IAuthService
    {
        private readonly IAuthRepository _authRepository;

        private readonly IEntityRepository<User> _userRepository;

        private readonly IEntityRepository<RefreshToken> _tokenRepository;

        private readonly IMapper _mapper;

        private readonly IConfiguration _configuration;

        private readonly IWebHostEnvironment _environment;

        private readonly JwtSecurityTokenHandler _tokenHandler;

        private readonly SymmetricSecurityKey _securityKey;

        public AuthService(IAuthRepository authRepository,
                           IEntityRepository<User> userRepository,
                           IEntityRepository<RefreshToken> tokenRepository,
                           IMapper mapper,
                           IConfiguration configuration,
                           IWebHostEnvironment environment,
                           IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _authRepository = authRepository;
            _userRepository = userRepository;
            _tokenRepository = tokenRepository;

            _mapper = mapper;

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

                await _userRepository.AddEntityAsync(userToRegister);

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

        public async Task <DataServiceResponse<UserTokensDTO>> LoginUser(string name, string password)
        {
            DataServiceResponse<UserTokensDTO> response = new DataServiceResponse<UserTokensDTO>();

            try
            {
                User userToLogin = await _userRepository.GetEntityAsync(
                    predicate: user => user.Name == name
                );

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
                    string accessToken = CreateAccessToken(
                        userToLogin,
                        DateTime.UtcNow.AddMinutes(
                            Convert.ToInt16(_configuration["TokensLifetime:AccessTokenMinutes"])
                        )
                    );

                    string refreshToken = CreateRefreshToken();

                    RefreshToken refreshTokenEntity = CreateRefreshTokenEntity(
                        userToLogin.Id,
                        refreshToken
                    );

                    await _tokenRepository.AddEntityAsync(refreshTokenEntity);

                    response.Data = new UserTokensDTO()
                    {
                        AccessToken = accessToken,
                        RefreshToken = refreshToken
                    };

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

        public async Task <BaseServiceResponse> LogoutUser(string token)
        {
            BaseServiceResponse response = new BaseServiceResponse();

            try
            {
                // Use DTO
                User tokenOwner = await _userRepository.GetEntityAsync(
                    predicate: user => user.RefreshTokens.Any(ownedToken => ownedToken.Token == token),
                    entitiesToInclude: new Expression<Func<User, object>>[]
                    {
                        user => user.RefreshTokens
                    }
                );

                if (tokenOwner == null)
                {
                    response.Success = false;
                    response.Message = "Token is invalid";

                    return response;
                }

                RefreshToken oldRefreshToken = tokenOwner.RefreshTokens.Single(
                    ownedToken => ownedToken.Token == token
                );

                await _tokenRepository.DeleteEntityAsync(oldRefreshToken);

                response.Success = true;

                return response;

            }
            catch (Exception exception)
            {
                response.Success = false;
                response.Message = exception.Message;
            }

            return response;
        }

        public async Task <DataServiceResponse<UserTokensDTO>> RefreshAccessToken(string token)
        {
            DataServiceResponse<UserTokensDTO> response = new DataServiceResponse<UserTokensDTO>();

            try
            {
                // Use DTO
                User tokenOwner = await _userRepository.GetEntityAsync(
                    predicate: user => user.RefreshTokens.Any(ownedToken => ownedToken.Token == token),
                    entitiesToInclude: new Expression<Func<User, object>>[]
                    {
                        user => user.RefreshTokens
                    }
                );

                if (tokenOwner == null)
                {
                    response.Success = false;
                    response.Message = "Token is invalid";

                    return response;
                }

                RefreshToken oldRefreshToken = tokenOwner.RefreshTokens.Single(
                    ownedToken => ownedToken.Token == token
                );

                /*
                Even though receiving expired refresh token is unlikely:
                1. we use session cookie to deny access to this method if session has ended
                2. we rotate refresh token every time we need new access token

                It never hurts to double check
                */
                if (DateTime.UtcNow >= oldRefreshToken.Expires)
                {
                    response.Success = false;
                    response.Message = "Token has expired";

                    return response;
                }

                // Remove old token
                await _tokenRepository.DeleteEntityAsync(oldRefreshToken);

                // Create and add new token
                string newRefreshToken = CreateRefreshToken();

                RefreshToken newRefreshTokenEntity = CreateRefreshTokenEntity(
                    tokenOwner.Id,
                    newRefreshToken
                );

                await _tokenRepository.AddEntityAsync(newRefreshTokenEntity);

                // We also create new access token
                string newAccessToken = CreateAccessToken(
                    tokenOwner,
                    DateTime.UtcNow.AddMinutes(
                        Convert.ToInt16(_configuration["TokensLifetime:AccessTokenMinutes"])
                    )
                );

                response.Data = new UserTokensDTO()
                {
                    AccessToken = newAccessToken,
                    RefreshToken = newRefreshToken
                };

                response.Success = true;
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

                // Besides id, we only need one field ...
                UserConfirmEmailDTO userToConfirmEmail = await _userRepository.GetEntityAsync(
                    id: userId,
                    columnsToSelect: user => new UserConfirmEmailDTO()
                    {
                        Id = user.Id,
                        EmailIsConfirmed = user.EmailIsConfirmed
                    }
                );

                if (userToConfirmEmail.EmailIsConfirmed)
                {
                    response.Success = false;
                    response.Message = "Your email is already confirmed";

                    return response;
                }

                userToConfirmEmail.EmailIsConfirmed = true;

                await _userRepository.UpdateEntityAsync(
                    _mapper.Map<User>(userToConfirmEmail),
                    new[] { nameof(User.EmailIsConfirmed) }
                );

                response.Success = true;
                response.Message = "Your email was successfully confirmed";
            }
            catch (SecurityTokenExpiredException exception)
            {
                _ = exception;

                /*
                We could've used a DTO here as well
                But ommitting two fields (hash and salt) and then using automapper
                didn't seem like considerable performance improvement
                */
                User userToResendEmail = await _userRepository.GetEntityAsync(userId);

                /*
                Just in case if user revisits confirmation link after it expired
                and after the email was already confirmed (although, we hide the route on the client side)
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

        private string CreateRefreshToken()
        {
            byte[] randomInt = new byte[32];

            using (RNGCryptoServiceProvider generator = new RNGCryptoServiceProvider())
            {
                generator.GetBytes(randomInt);

                return Convert.ToBase64String(randomInt);
            }
        }

        private RefreshToken CreateRefreshTokenEntity(int userId, string token)
        {
            return new RefreshToken()
            {
                UserId = userId,
                Token = token,
                Expires = DateTime.UtcNow.AddHours(
                    Convert.ToInt16(_configuration["TokensLifetime:RefreshTokenHours"])
                )
            };
        }

        private string CreateAccessToken(User user, DateTime expires)
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
                Expires = expires,
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
            Create access token and add it as a querystring param to callback url
            that leads back to the client app
            Token is then parsed by the client side and relayed to ConfirmEmailAddress method
            */
            string confirmationToken = CreateAccessToken(
                user,
                DateTime.UtcNow.AddHours(
                    Convert.ToInt16(_configuration["TokensLifetime:ConfirmationTokenHours"])
                )
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
