CREATE TABLE [dbo].[UUID2View] (
    [UUID]        UNIQUEIDENTIFIER DEFAULT (newid()) NOT NULL,
    [vName]       NVARCHAR (255)   NULL,
    [pvName]      NVARCHAR (255)   NULL,
    [CheckObject] BIT              NULL,
    [RequiredCID] BIT              DEFAULT ((0)) NULL,
    CONSTRAINT [PK_UUID2View] PRIMARY KEY CLUSTERED ([UUID] ASC)
);






GO
EXECUTE sp_addextendedproperty @name = N'DS_UUID2View_pvName', @value = N'公開view表，例：vd_Video_Pub', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'UUID2View', @level2type = N'COLUMN', @level2name = N'pvName';




GO
EXECUTE sp_addextendedproperty @name = N'DS_UUID2View_vName', @value = N'權限view表，例：vd_Video', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'UUID2View', @level2type = N'COLUMN', @level2name = N'vName';




GO
EXECUTE sp_addextendedproperty @name = N'DS_UUID2View_UUID', @value = N'PublicAPI', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'UUID2View', @level2type = N'COLUMN', @level2name = N'UUID';


GO
EXECUTE sp_addextendedproperty @name = N'DS_UUID2View_', @value = N'Public API', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'UUID2View';


GO
EXECUTE sp_addextendedproperty @name = N'DS_UUID2View_CheckObject', @value = N'null|0|1 → view表無Object|有Object，判斷R權限|有Object且hide需判斷M權限', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'UUID2View', @level2type = N'COLUMN', @level2name = N'CheckObject';

