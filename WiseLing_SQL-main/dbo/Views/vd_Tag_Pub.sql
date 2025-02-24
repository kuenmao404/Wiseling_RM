CREATE view vd_Tag_Pub as
select tid, text COLLATE Chinese_Taiwan_Stroke_CI_AS AS 'text', useCount
from Tag T
GO
GRANT SELECT
    ON OBJECT::[dbo].[vd_Tag_Pub] TO [WiseLingPublic]
    AS [dbo];

