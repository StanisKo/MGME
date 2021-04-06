namespace MGME.Core.DTOs.User
{
    public class UserPasswordDTO : BaseEntityDTO
    {
        public byte[] PasswordHash { get; set; }

        public byte[] PasswordSalt { get; set; }
    }
}