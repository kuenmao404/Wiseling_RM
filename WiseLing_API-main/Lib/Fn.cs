//using Newtonsoft.Json;
using Dapper;
using WiseLing_API.Model;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.ComponentModel;
using System.Data;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using Microsoft.AspNetCore.Http;


namespace WiseLing_API.Lib
{
    public class Fn
    {

        public string FormatTimeSpan(int seconds)
        {
            TimeSpan timeSpan = TimeSpan.FromSeconds(seconds);
            string formattedTime = "";

            // 檢查每個部分是否為0，如果不是0才顯示
            if (timeSpan.Days != 0)
                formattedTime += $"{timeSpan.Days}天";
            if (timeSpan.Hours != 0)
                formattedTime += $"{timeSpan.Hours}小時";
            if (timeSpan.Minutes != 0)
                formattedTime += $"{timeSpan.Minutes}分";
            if (timeSpan.Seconds != 0 || (timeSpan.Days == 0 && timeSpan.Hours == 0 && timeSpan.Minutes == 0))
                formattedTime += $"{timeSpan.Seconds}秒";
            return formattedTime;
        }

        public string Error2txtString(HttpContext context, string errMessage, DIModel di, UUIDModel uuidModel)
        {
            string path = context.Request.Path.ToString();
            string method = context.Request.Method.ToString();
            string SID = context.Items["SID"]?.ToString() ?? "-1";

            int bErrorLog = (int)context.Items["bErrorLog"];

            string parameters = "Parameters :[";

            string? objectName = uuidModel.ObjectName;
            if (context.Items.ContainsKey("ObjectName"))
            {
                objectName = context.Items["ObjectName"].ToString();
            }

            bool bParam = false;
            IDictionary<string, object> param_ds = null;

            if (bErrorLog == 0)
            {
                return $"\nSID:{SID}\n{method} - {path}\n{errMessage}\n";
            }
            else if (!objectName.IsNullOrEmpty())
            {
                try
                {
                    string strsql = @$"exec xp_getParamDS @objectName";

                    using (var db = new AppDb())
                    {
                        var data = db.Connection.QueryFirstOrDefault(strsql, new { objectName });

                        param_ds = (IDictionary<string, object>)data;
                    }
                }
                catch (Exception ex)
                {
                    param_ds = null;
                }

            }

            //從GET，Body，Form取得參數
            if (method == "GET")
            {
                var query = context.Request.Query;

                if (query.Count > 0)
                {
                    bParam = true;
                    parameters = "Query - " + parameters;

                    foreach (var item in query)
                    {
                        if (writeParam("_" + item.Key, param_ds))
                            parameters += $"{item.Key}:{item.Value}, ";
                    }
                }
            }
            else if (context.Request.ContentType == "application/json")
            {
                if (context.Request.ContentLength > 0)
                {
                    bParam = true;
                    parameters = "Body - " + parameters;

                    context.Request.Body.Position = 0;

                    try
                    {
                        var columnjson = (JObject)JsonConvert.DeserializeObject(di.RequestBody);

                        foreach (var item in columnjson)
                        {
                            if (writeParam("_@" + item.Key, param_ds))
                                parameters += $"{item.Key}:{item.Value}, ";
                        }
                    }
                    catch (Exception ex)
                    {
                        bParam = false;
                    }

                }
            }
            else
            {
                bParam = true;
                try
                {
                    var form = context.Request.Form;
                    if (form.Count > 0)
                    {
                        parameters = "Form - " + parameters;
                        foreach (var item in form)
                        {
                            if (writeParam("_@" + item.Key, param_ds))
                                parameters += $"{item.Key}:{item.Value}, ";
                        }
                    }
                }
                catch
                {
                    //不是query、body、form
                    parameters = "[未知傳遞方式";
                }
            }

            parameters += "]";

            return $"\nSID:{SID}\n{method} - {path}\n{(bParam ? parameters + "\n" : "")}{errMessage}\n";
        }

        public bool writeParam(string key, IDictionary<string, object> param_ds)
        {
            if (param_ds != null)
            {
                var ds = param_ds[key]?.ToString();

                if (ds == null || ds == "" || ds == "0")
                {
                    return true;
                }
            }
            else
            {
                return true;
            }

            return false;
        }

        public bool HasProperty<T>(string propertyName)
        {
            return typeof(T).GetProperty(propertyName) != null;
        }

        public T Post<T>(HttpClient client, string apicmd, dynamic data, out bool result)
        {
            result = false;

            string data_str = JsonConvert.SerializeObject(data);

            HttpContent content = new StringContent(data_str, Encoding.UTF8, "application/json");

            // 最終以post形式，發送request至驗證伺服器{apiURI}位置
            HttpResponseMessage response = client.PostAsync(apicmd, content).GetAwaiter().GetResult();
            if (response != null)
            {
                // 檢查response是否為200
                if (response.IsSuccessStatusCode)
                {
                    // 取得response json
                    string result_str = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();
                    result = true;
                    return JsonConvert.DeserializeObject<T>(result_str, new JsonSerializerSettings { MetadataPropertyHandling = MetadataPropertyHandling.Ignore });
                }
                else
                {
                    return default;
                }
            }
            else
            {
                return default;
            }
        }

        public bool HasProperty(dynamic obj, string propertyName)
        {
            try
            {
                var dictionary = (IDictionary<string, object>)obj;
                return dictionary.ContainsKey(propertyName);
            }
            catch
            {
                return false;
            }
        }

        public T Get<T>(HttpClient client, string apicmd, out bool result)
        {
            result = false;
           
            HttpResponseMessage response = client.GetAsync(apicmd).GetAwaiter().GetResult();
            if (response != null)
            {
                // 檢查response是否為200
                if (response.IsSuccessStatusCode)
                {
                    // 取得response json
                    string result_str = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();
                    result = true;
                    return JsonConvert.DeserializeObject<T>(result_str, new JsonSerializerSettings { MetadataPropertyHandling = MetadataPropertyHandling.Ignore });
                }
                else
                {
                    return default;
                }
            }
            else
            {
                return default;
            }
        }

        public string? getDisplayname(Type modelType, string key, ActionContext actionContext)
        {
            try
            {
                var property = modelType.GetProperty(key);
                if (property == null) return null;

                var getCustom = property.GetCustomAttributes(typeof(DisplayNameAttribute), true).Cast<DisplayNameAttribute>().SingleOrDefault();
                if (getCustom == null) return null;

                return getCustom.DisplayName.ToString();
            }
            catch (Exception ex)
            {
                return null;
            }

        }

        public Uri? signInSSO(SignInSSO signInSSO, string Weburi, string state, int sid)
        {
            bool bNeedMoveIT108 = false;
            using (var db = new AppDb())
            {
                string strSql = "xp_signIn_sso";
                var p = new DynamicParameters();
                p.Add("@uid", signInSSO.uid);
                p.Add("@account", signInSSO.account);
                p.Add("@name", signInSSO.name);
                p.Add("@email", signInSSO.email);
                p.Add("@site", signInSSO.site);
                p.Add("@pic", signInSSO.picture);
                p.Add("@sid", signInSSO.sid);
                p.Add("@status", dbType: DbType.Boolean, direction: ParameterDirection.Output);
                p.Add("@message", dbType: DbType.String, direction: ParameterDirection.Output, size: 255);
                p.Add("@bNeedMoveIT108", dbType: DbType.Boolean, direction: ParameterDirection.Output);
                db.Connection.Execute(strSql, p, commandType: CommandType.StoredProcedure);
                bool status = p.Get<bool>("@status");
                string message = p.Get<string>("@message");
                bNeedMoveIT108 = p.Get<bool>("@bNeedMoveIT108");

                new UUID().insertLogManTx("GET", strSql, p, sid, db);
            }

            Uri uri;

            if (WebUtility.UrlDecode(state).StartsWith("https://judge.wke.csie.ncnu.edu.tw"))
            {
                uri = new Uri($"{state}");
            }
            else
            {
                uri = bNeedMoveIT108 ? new Uri($"{Weburi}/trasnsfer/it108{(state == null ? "" : $"?state={state}")}") : new Uri($"{Weburi}{(state == null ? "" : state)}");
            }

            return uri;
        }


        public string second2Time(int s)
        {

            TimeSpan time = TimeSpan.FromSeconds(s);

            string formattedTime = (time.Hours > 0) ?
                string.Format("{0:D2}:{1:D2}:{2:D2}", time.Hours, time.Minutes, time.Seconds) :
                string.Format("{0:D2}:{1:D2}", time.Minutes, time.Seconds);

            return formattedTime;
        }


        public async Task<NoteFileDownload?> getNotePDForDocx(int mid, int vid, int cid, int mode)
        {
            var config = AppConfig.Config;

            string Weburi = config["Weburi"];

            string strsql = @$"select content
                                , cast(startTime as int) as startTime,  cname
                                from vd_MemberNoteClass_Front
                    where mid = @mid and vid = @vid and cid = @cid order by startTime";

            List<dynamic> data;
            using (var db = new AppDb())
            {

                data = db.Connection.Query(strsql, new { mid, cid, vid }).ToList();
            }

            if (data != null && data.Count > 0)
            {
                Note2File note2File = new Note2File
                {
                    md = "",
                    id = vid
                };

                NoteFileDownload noteFileDownload = new NoteFileDownload();

                noteFileDownload.filename = $"{vid}-{data[0].cname}.{(mode == 0 ? "docx": "pdf")}";

                string Openapiserver = config["Openapiserver"];

                for (int i = 0; i < data.Count; i++)
                {

                    string time = new Fn().second2Time(data[i].startTime);

                    note2File.md += (i == 0 ? "" : "\n\n---\n\n");

                    note2File.md += $"# [{time}]({Weburi}/watch?v={vid}&t={data[i].startTime})";
                    note2File.md += "\n\n";
                    note2File.md += data[i].content;

                }
                HttpClient client = new HttpClient()
                {
                    BaseAddress = new Uri(Openapiserver)
                };

                string data_str = JsonConvert.SerializeObject(note2File);

                HttpContent content = new StringContent(data_str, Encoding.UTF8, "application/json");

                // 最終以post形式，發送request至驗證伺服器{apiURI}位置

                string cmd = mode == 0 ? "api/md/docx" : "/api/md/pdf";

                HttpResponseMessage response = client.PostAsync(cmd, content).GetAwaiter().GetResult();
                if (response.IsSuccessStatusCode)
                {
                    noteFileDownload.content = await response.Content.ReadAsByteArrayAsync();

                    return noteFileDownload;
                }

            }
           
            return null;
            
        }

       
    }
}
