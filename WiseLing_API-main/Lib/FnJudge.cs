using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using System.Text;

namespace WiseLing_API.Lib
{
    public class FnJudge
    {
        public T Delete<T>(HttpClient httpClient, string apicmd, out int statusCode)
        {
            statusCode = 0;

            HttpResponseMessage response = httpClient.DeleteAsync(apicmd).GetAwaiter().GetResult();

            if (response != null)
            {
                try
                {
                    statusCode = (int)response.StatusCode;
                    string result_str = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();
                    return JsonConvert.DeserializeObject<T>(result_str, new JsonSerializerSettings { MetadataPropertyHandling = MetadataPropertyHandling.Ignore });
                }
                catch (Exception ex)
                {
                    return default;
                }
            }
            else
            {
                return default;
            }
            
        }
        public T PutForm<T>(HttpClient httpClient, string apicmd, MultipartFormDataContent formData, out int statusCode)
        {
            statusCode = 0;

            HttpResponseMessage response = httpClient.PutAsync(apicmd, formData).GetAwaiter().GetResult();

            if (response != null)
            {
                try
                {
                    statusCode = (int)response.StatusCode;
                    string result_str = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();
                    return JsonConvert.DeserializeObject<T>(result_str, new JsonSerializerSettings { MetadataPropertyHandling = MetadataPropertyHandling.Ignore });
                }
                catch(Exception ex)
                {
                    return default;
                }
            }
            else
            {
                return default;
            }
            
        }

        public T PostForm<T>(HttpClient httpClient, string apicmd, MultipartFormDataContent formData, out int statusCode)
        {
            statusCode = 0;
            
            HttpResponseMessage response =  httpClient.PostAsync(apicmd, formData).GetAwaiter().GetResult();

            if (response != null)
            {
                try
                {
                    statusCode = (int)response.StatusCode;
                    string result_str = response.Content.ReadAsStringAsync().GetAwaiter().GetResult(); ;
                    return JsonConvert.DeserializeObject<T>(result_str, new JsonSerializerSettings { MetadataPropertyHandling = MetadataPropertyHandling.Ignore });
                }
                catch (Exception ex)
                {
                    return default;
                }
            }
            else
            {
                return default;
            }
            
        }


    }
}
