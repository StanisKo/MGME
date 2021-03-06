using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Security.Claims;
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

namespace MGME.Core.Services.AuthService
{
    public class AuthService : BaseEntityService, IAuthService
    {
        private readonly IEntityRepository<User> _userRepository;

        private readonly IEntityRepository<RefreshToken> _tokenRepository;

        private readonly IHashingService _hashingService;

        private readonly IMapper _mapper;

        private readonly IConfiguration _configuration;

        private readonly IWebHostEnvironment _environment;

        private readonly JwtSecurityTokenHandler _tokenHandler;

        private readonly SymmetricSecurityKey _securityKey;

        public AuthService(IEntityRepository<User> userRepository,
                           IEntityRepository<RefreshToken> tokenRepository,
                           IHashingService hashingService,
                           IMapper mapper,
                           IConfiguration configuration,
                           IWebHostEnvironment environment,
                           IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _userRepository = userRepository;
            _tokenRepository = tokenRepository;

            _hashingService = hashingService;

            _mapper = mapper;

            _configuration = configuration;
            _environment = environment;

            _tokenHandler = new JwtSecurityTokenHandler();

            _securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                Environment.GetEnvironmentVariable("JWTKEY")
                )
            );
        }

        public async Task <BaseServiceResponse> RegisterUser(string name, string email, string password)
        {
            BaseServiceResponse response = new();

            try
            {
                bool userNameIsTaken = await _userRepository.CheckIfEntityExistsAsync(
                    user => String.Equals(user.Name.ToLower(), name.ToLower())
                );

                if (userNameIsTaken)
                {
                    response.Success = false;
                    response.Message = "Username is already taken";

                    return response;
                }

                bool emailIsTaken = await _userRepository.CheckIfEntityExistsAsync(
                    user => String.Equals(user.Email.ToLower(), email.ToLower())
                );

                if (emailIsTaken)
                {
                    response.Success = false;
                    response.Message = "Email is already taken";

                    return response;
                }

                _hashingService.CreatePasswordHash(password, out byte[] passwordHash, out byte[] passwordSalt);

                User userToRegister = new()
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
            DataServiceResponse<UserTokensDTO> response = new();

            try
            {
                User userToLogin = await _userRepository.GetEntityAsync(
                    predicate: user => user.Name == name
                );

                if (userToLogin is null)
                {
                    response.Success = false;
                    response.Message = "Either username or password is wrong";

                    return response;
                }

                bool passwordIsValid = _hashingService.VerifyPasswordHash(
                    password,
                    userToLogin.PasswordHash,
                    userToLogin.PasswordSalt
                );

                if (!passwordIsValid)
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
                            Convert.ToInt32(_configuration["TokensLifetime:AccessTokenMinutes"])
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
            BaseServiceResponse response = new();

            try
            {
                UserRefreshTokenDTO tokenOwner = await _userRepository.GetEntityAsync(
                    predicate: user => user.RefreshTokens.Any(ownedToken => ownedToken.Token == token),
                    include: new[]
                    {
                        "RefreshTokens"
                    },
                    select: user => new UserRefreshTokenDTO()
                    {
                        Id = user.Id,
                        RefreshTokens = user.RefreshTokens
                    }
                );

                if (tokenOwner is null)
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
            DataServiceResponse<UserTokensDTO> response = new();

            try
            {
                // We query for user and not DTO, since we need additional values for JWT claims
                User tokenOwner = await _userRepository.GetEntityAsync(
                    predicate: user => user.RefreshTokens.Any(ownedToken => ownedToken.Token == token),
                    include: new[]
                    {
                        "RefreshTokens"
                    }
                );

                if (tokenOwner is null)
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
                3. refresh token cookie also has an expiration

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
                        Convert.ToInt32(_configuration["TokensLifetime:AccessTokenMinutes"])
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
            BaseServiceResponse response = new();

            JwtSecurityToken securityToken = _tokenHandler.ReadToken(token) as JwtSecurityToken;

            // Somehow claim.Type == ClaimTypes.Name returns null ...
            int userId = Convert.ToInt32(
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
                    out SecurityToken _
                );

                // Besides id, we only need one field ...
                ConfirmUserEmailDTO userToConfirmEmail = await _userRepository.GetEntityAsync(
                    id: userId,
                    select: user => new ConfirmUserEmailDTO()
                    {
                        Id = user.Id,
                        EmailIsConfirmed = user.EmailIsConfirmed
                    }
                );

                if (userToConfirmEmail is null)
                {
                    response.Success = false;
                    response.Message = "User does not exist";

                    return response;
                }

                // Might happen if user revisits the public route
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
            catch (SecurityTokenExpiredException)
            {
                /*
                We could've used a DTO here as well
                But omitting two fields (hash and salt) and then using automapper
                didn't seem like considerable performance improvement
                */
                User userToResendEmail = await _userRepository.GetEntityAsync(userId);

                if (userToResendEmail is null)
                {
                    response.Success = false;
                    response.Message = "User does not exist";

                    return response;
                }

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
            }
            catch (Exception exception)
            {
                // Otherwise it's issuer/audience/signature exception or database exception
                response.Success = false;
                response.Message = exception.Message;
            }

            return response;
        }

        private static string CreateRefreshToken()
        {
            byte[] randomInt = new byte[32];

            using RNGCryptoServiceProvider generator = new();

            generator.GetBytes(randomInt);

            return Convert.ToBase64String(randomInt);
        }

        private RefreshToken CreateRefreshTokenEntity(int userId, string token)
        {
            return new RefreshToken()
            {
                UserId = userId,
                Token = token,
                Expires = DateTime.UtcNow.AddHours(
                    Convert.ToInt32(_configuration["TokensLifetime:RefreshTokenHours"])
                )
            };
        }

        private string CreateAccessToken(User user, DateTime expires)
        {
            List<Claim> claims = new()
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Role, user.Role)
            };

            SigningCredentials credentials = new SigningCredentials(
                _securityKey,
                SecurityAlgorithms.HmacSha512Signature
            );

            SecurityTokenDescriptor tokenDescriptor = new()
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
                    Convert.ToInt32(_configuration["TokensLifetime:ConfirmationTokenHours"])
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

            string template;

            using (StreamReader sourceReader = File.OpenText(pathToEmailTemplate))
            {
                template = await sourceReader.ReadToEndAsync();
            }

            BodyBuilder bodyBuilder = new()
            {
                /*
                We avoid formatting the template, since it contains other source of {} brackets
                and use replace to insert the link
                We also don't use Razor since it's a simple job
                */
                HtmlBody = template.Replace("confirmation-url", confirmationURL)
            };

            confirmationMessage.Body = bodyBuilder.ToMessageBody();

            using (SmtpClient smtpClient = new())
            {
                await smtpClient.ConnectAsync(
                    _configuration["EmailConfiguration:SmtpServer"],
                    Convert.ToInt32(_configuration["EmailConfiguration:Port"]),
                    true
                );

                await smtpClient.AuthenticateAsync(
                    _configuration["EmailConfiguration:From"],
                    Environment.GetEnvironmentVariable(
                        "EMAILSENDERPASSWORD"
                    )
                );

                await smtpClient.SendAsync(confirmationMessage);

                await smtpClient.DisconnectAsync(true);
            }
        }
    }
}
