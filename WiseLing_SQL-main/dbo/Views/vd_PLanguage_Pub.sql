
CREATE view vd_PLanguage_Pub as
select oid as plid, cname as name, cdes as [key], 
	edes as fileExtension 
from Object where type = 29
GO
GRANT SELECT
    ON OBJECT::[dbo].[vd_PLanguage_Pub] TO [WiseLingPublic]
    AS [dbo];

