using Azure;
using Dapper;
using MailKit.Security;
using MimeKit;
using NLog;
using System.ComponentModel;
using System.Data;
using WiseLing_API.Model;

namespace WiseLing_API.Lib
{
    public class Mail
    {
        public bool sendEMail(string title, string des, string email)
        {

            var config = AppConfig.Config;

            string sender = config["EMail:Sender"];
            string senderEMail = config["EMail:SenderEMail"];
            string senderPWD = config["EMail:SenderPWD"];
            string host = config["EMail:Host"];
            int port = Int32.Parse(config["EMail:Port"]);
            bool ssl = bool.Parse(config["EMail:SSL"]);

            var message = new MimeMessage();

            message.From.Add(new MailboxAddress(sender, senderEMail));

            message.To.Add(new MailboxAddress("", email));

            message.Subject = title;

            var bodyBuilder = new BodyBuilder();

            bodyBuilder.TextBody = des;

            message.Body = bodyBuilder.ToMessageBody();
            Logger logger = LogManager.GetCurrentClassLogger();

            bool sendEMailOK = false;
            using (var client = new MailKit.Net.Smtp.SmtpClient())
            {
                bool bSend = false;
                try
                {
                    client.Connect(host, port, SecureSocketOptions.StartTls);
                    client.Authenticate(senderEMail, senderPWD);
                    bSend = true;
                }
                catch (ArgumentException e)
                {
                    logger.Error(e.Message);
                }

                if (bSend)
                {
                    try
                    {
                        client.Send(message);
                        sendEMailOK = true;
                    }
                    catch
                    {
                        sendEMailOK = false;
                    }
                    client.Disconnect(true);
                }

            }

            return sendEMailOK;
        }
        
        public ResponseOKModel sendCourseEMail(IviteCourseModel body, int mid, int sid)
        {
            ResponseOKModel responseOK = new ResponseOKModel("寄信失敗", false);

            var config = AppConfig.Config;

            int expires = Int32.Parse(config["EMail:Expires"]);

            IviteOutputModel invite = new IviteOutputModel();
            using (var db = new AppDb())
            {
                string strSql = "xp_inviteCourseMember";
                var p = new DynamicParameters();
                p.Add("@courseCID", body.courseCID);
                p.Add("@cid", body.cid);
                p.Add("@email", body.email);
                p.Add("@expires", expires);
                p.Add("@mid", mid);
                p.Add("@sid", sid);
                p.Add("@iid", dbType: DbType.Int32, direction: ParameterDirection.Output);
                p.Add("@courseName", dbType: DbType.String, direction: ParameterDirection.Output, size: 255);
                p.Add("@gname", dbType: DbType.String, direction: ParameterDirection.Output, size: 255);
                p.Add("@token", dbType: DbType.Guid, direction: ParameterDirection.Output);
                p.Add("@expired", dbType: DbType.String, direction: ParameterDirection.Output, size: 255);
                p.Add("@status", dbType: DbType.Boolean, direction: ParameterDirection.Output);
                p.Add("@message", dbType: DbType.String, direction: ParameterDirection.Output, size: 255);
                db.Connection.Execute(strSql, p, commandType: CommandType.StoredProcedure);
                invite.iid = p.Get<Int32?>("@iid");
                invite.courseName = p.Get<string?>("@courseName");
                invite.gname = p.Get<string?>("@gname");
                invite.token = p.Get<Guid?>("@token");
                invite.expired = p.Get<string?>("@expired");
                responseOK.status = p.Get<bool>("@status");
                responseOK.message = p.Get<string>("@message");
            }

            if (responseOK.status)
            {
                
                string sender = config["EMail:Sender"];
                string webURI = config["Weburi"];


                string title = $"{sender} - 課程邀請";
                string des =  $"課程：{invite.courseName}\r\n" +
                    $"群組：{invite.gname}\r\n" +
                    $"課程連結：{webURI}/course/{body.courseCID}\r\n" +
                    $"邀請連結：{webURI}/auth?token={invite.token}  (請勿將連結洩漏給他人)\r\n" +
                    $"連結時效：{new Fn().FormatTimeSpan(expires)}\r\n" +
                    $"連結到期日：{invite.expired}\r\n\r\n" +
                    "注意事項：\r\n" +
                    $"1. 請先登入{sender} ({webURI})。\r\n\r\n" +
                    "2. 登入後點擊上方邀請連結，完成開通課程邀請。\r\n";


                bool sendEMailOK = sendEMail(title, des, body.email);
                responseOK.status = sendEMailOK;
                responseOK.message = sendEMailOK ? "寄信成功" : "寄信失敗";

                using (var db = new AppDb())
                {
                    string strSqlRes = "xp_inviteGroupResponse";
                    var p = new DynamicParameters();
                    p.Add("@iid", invite.iid);
                    p.Add("@status", sendEMailOK);
                    p.Add("@sid", sid);
                    db.Connection.Execute(strSqlRes, p, commandType: CommandType.StoredProcedure);
                }
            }

            return responseOK;

        }

        public ResponseOKModel deleteCourseEMail(HttpContext httpContext, DeleteInviteCourseModel body, int mid, int sid)
        {
            ResponseOKModel responseOK = new ResponseOKModel("刪除失敗", false);

            using (var db = new AppDb())
            {
                string strSql = "xp_deleteInviteCourse";
                var p = new DynamicParameters();
                p.Add("@iid", body.iid);
                p.Add("@courseCID", body.courseCID);
                p.Add("@cid", body.cid);
                p.Add("@mid", mid);
                p.Add("@sid", sid);
                p.Add("@status", dbType: DbType.Boolean, direction: ParameterDirection.Output);
                p.Add("@message", dbType: DbType.String, direction: ParameterDirection.Output, size: 255);
                db.Connection.Execute(strSql, p, commandType: CommandType.StoredProcedure);
                responseOK.status = p.Get<bool>("@status");
                responseOK.message = p.Get<string>("@message");

                new UUID().insertLogManTx("DELETE", strSql, p, sid, db);
            }

            return responseOK;
        }
    }
}
