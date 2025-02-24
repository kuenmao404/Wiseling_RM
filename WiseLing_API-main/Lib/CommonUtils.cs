using System.Text;

namespace WiseLing_API.Lib
{
    public static class CommonUtils
    {
        public static string Base64Encode(string AStr)
        {
            return Convert.ToBase64String(Encoding.UTF8.GetBytes(AStr));
        }

        public static string Base64Decrypt(string str)
        {
            try
            {
                string tmp = Encoding.UTF8.GetString(Convert.FromBase64String(str));
                Guid tmp2 = Guid.Parse(tmp);

                return tmp;
            }
            catch
            {
                return null;
            }
        }
    }
}
