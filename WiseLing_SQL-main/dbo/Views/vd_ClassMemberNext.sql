CREATE view vd_ClassMemberNext as
select M.MID, C.CID 'ClassID', m.SSOID, m.Img, m.Name, m.Account, m.EMail, m.SSO, CC.CID, cc.Type, CC.CName, cc.bHided 'hide', CC.NamePath, CC.IDPath
from vs_Member M, Class C, Inheritance I, Class CC
where M.ClassID = C.CID and C.CID = I.PCID and I.CCID = CC.CID