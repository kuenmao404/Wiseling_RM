CREATE view dbo.vs_Member
as
select	o.OID 'MID', o.[Type], isnull(m.NickName, o.CName) 'Name', o.CDes 'img', o.EName 'Account', o.EDes 'SSO', 
		o.CName as 'SSOName', m.NickName,
		m.Account 'SSOID', m.PWD, m.Valid, m.Status, m.VerifyCode, m.EMail, 
		m.Phone, m.Address, m.Birthday, m.Nation, m.ClassID, m.SendEMailOK,
		m.LastLoginDT, m.LoginCount, m.LoginErrCount, o.nOutlinks, 
		o.Since, o.LastModifiedDT, m.bPrev, o.bHided, o.bDel
from	Member m, Object o 
where	m.MID = o.OID and o.bDel = 0