using Azure;
using Dapper;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using NLog;
using System;
using System.Data;
using System.Security.Cryptography;
using System.Web;
using System.Xml;
using WiseLing_API.Model;
using static Org.BouncyCastle.Crypto.Engines.SM2Engine;

namespace WiseLing_API.Lib
{
    public class YoutubeAPI
    {
        public string checkYouTubeURI(string url, int mode)
        {
            // mode 0|1 (影片|清單)

            Uri youtubeURL;
            string id = null;

            if (!Uri.TryCreate(url, UriKind.Absolute, out youtubeURL))
            {
                return id;
            }

            if (url.StartsWith("https://www.youtube.com/watch") || url.StartsWith("https://www.youtube.com/playlist"))
            {
                string query = youtubeURL.Query;
                var queryParameters = HttpUtility.ParseQueryString(query);
                id = queryParameters.Get(mode == 0 ? "v" : "list");
            }
            else if (url.StartsWith("https://youtu.be/") && mode == 0)
            {
                string[] router = youtubeURL.Segments;
                id = router[1];
            }

            return id;
        }

        public SingleV_YTAPI insertVideo(int sid, string videoID, dynamic item, int mode)
        {
            // mode 0|1 (影片|清單)
            SingleV_YTAPI response = new SingleV_YTAPI("錯誤", false);

            var snippet = item.snippet;

            string publishedAt = snippet.publishedAt;
            string channelID = snippet.channelId;
            string title = snippet.title;
            string description = snippet.description;
            string channelTitle = snippet.channelTitle;

            string categoryID = snippet?.categoryId;

            var contentDetails = item.contentDetails;

            var Detail_duration = contentDetails?.duration;
            int? duration = null;

            if (Detail_duration != null)
            {
                TimeSpan timeSpan = XmlConvert.ToTimeSpan(Detail_duration.ToString());
                duration = (int)timeSpan.TotalSeconds;
            }

            var status = item.status;
            if(mode == 0)
            {
                bool embeddable = status.embeddable;

                if (!embeddable)
                {
                    response.message= "該影片不允許嵌入";
                    return response;
                }
            }
            else
            {
                videoID = contentDetails.videoId;
            }
           

            using (var db = new AppDb())
            {
                string strSql = "xp_insertVideoFromApi";
                var p = new DynamicParameters();
                p.Add("@videoID", videoID);
                p.Add("@title", title);
                p.Add("@description", description);
                p.Add("@channelTitle", channelTitle);
                p.Add("@channelID", channelID);
                p.Add("@publishedAt", publishedAt);
                p.Add("@categoryID", categoryID);
                p.Add("@duration", duration);
                p.Add("@sid", sid);
                p.Add("@vid", dbType: DbType.Int32, direction: ParameterDirection.Output);
                db.Connection.Execute(strSql, p, commandType: CommandType.StoredProcedure);
                response.vid = p.Get<int?>("@vid");
            }

            if (response.vid == null)
            {
                response.message= "發生錯誤";
            }
            else
            {
                response.status = true;
                response.message = "新增或更新影片成功";
            }

            return response;
        }

        // mode 0|1 (影片|清單)
        public Response_YTAPI getVideoOrPlayList(HttpClient client, int sid, string? url, int mode = 0)
        {
            Response_YTAPI response = new Response_YTAPI("YouTube影片網址錯誤", false);

            var config = AppConfig.Config;
            string baseaddress = config["YouTube:VideoAPIURL"];
            string url_video = config["YouTube:Video"];
            string url_list = config["YouTube:List"];
            string[] key = config.GetSection("YouTube:Key").Get<string[]>();

            string id = checkYouTubeURI(url, mode);

            if (id.IsNullOrEmpty())
            {
                return response;
            }

            string pageToken = "";

            #region YouTubeAPI
            for (int i = 0; i < key.Length; i++)
            {
                int pagecount = 0;
                string cmd = $"{baseaddress}/{url_list}?part=snippet,id,contentDetails,status&playlistId={id}&key={key[i]}&maxResults=50{(pageToken.IsNullOrEmpty() ? "" : $"&pageToken={pageToken}")}";
                if(mode == 0)
                {
                    cmd = $"{baseaddress}/{url_video}?part=snippet,contentDetails,status&id={id}&key={key[i]}";
                }

                HttpResponseMessage result = client.GetAsync(cmd).GetAwaiter().GetResult();
                if (result!= null && result.IsSuccessStatusCode)
                {
                    string result_str = result.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    dynamic json = JsonConvert.DeserializeObject(result_str);

                    var item = json["items"];

                    if (item.Count == 0)
                    {
                        response.message= "找不到影片";
                        break;
                    }

                    if(mode == 0)
                    {
                        SingleV_YTAPI singleV = insertVideo(sid, id, item[0], mode);
                        response.message = singleV.message;
                        response.status = singleV.status;
                        response.vid = singleV.vid;
                        response.vid_str = "" + singleV.vid;

                        return response;
                    }
                    else
                    {
                        for (int j = 0; j < item.Count; j++)
                        {
                            var item_j = item[j];
                            SingleV_YTAPI singleV = insertVideo(sid, id, item_j, mode);
                            if (singleV.status)
                            {
                                response.vid_str =  response.vid_str + "," + singleV.vid;
                                response.vid = response.vid == null ? singleV.vid : response.vid;
                                response.status = singleV.status;
                                response.message = singleV.message;
                            }
                        }

                        var nextPageToken = json["nextPageToken"];
                        if (nextPageToken == null)
                        {
                            pageToken = "";
                            break;
                        }
                        else
                        {
                            pageToken = nextPageToken.ToString();
                        }

                        if (++pagecount >= 11)
                            break;
                            

                    }
                }
                else if ((int)result.StatusCode == 403)
                {
                    response.message= "當日YouTube API額度已用盡，請於隔日在使用";
                }
                else if ((int)result.StatusCode == 404)
                {
                    response.message= "找不到影片或清單，請確認該狀態為公開且為有效網址";
                    break;
                }
                else
                {
                    response.message= "YouTube API錯誤";

                    LogManager.GetCurrentClassLogger().Error($"YouTube API錯誤：{cmd}");
                }
            }
            #endregion


            return response;
        }
    }
}
