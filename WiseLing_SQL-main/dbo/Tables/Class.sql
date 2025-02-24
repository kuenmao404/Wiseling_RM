CREATE TABLE [dbo].[Class] (
    [CID]            INT             IDENTITY (1, 1) NOT NULL,
    [Type]           SMALLINT        NULL,
    [CName]          NVARCHAR (256)  NOT NULL,
    [CDes]           NVARCHAR (4000) NULL,
    [EName]          NVARCHAR (256)  NULL,
    [EDes]           NVARCHAR (4000) NULL,
    [IDPath]         VARCHAR (900)   NULL,
    [NamePath]       NVARCHAR (450)  NULL,
    [Since]          DATETIME        DEFAULT (getdate()) NOT NULL,
    [LastModifiedDT] DATETIME        DEFAULT (getdate()) NOT NULL,
    [nObject]        INT             DEFAULT ((0)) NOT NULL,
    [cRank]          TINYINT         DEFAULT ((0)) NULL,
    [oRank]          TINYINT         DEFAULT ((0)) NULL,
    [nLevel]         TINYINT         NULL,
    [nClick]         INT             DEFAULT ((0)) NOT NULL,
    [Keywords]       NVARCHAR (512)  DEFAULT ('') NULL,
    [OwnerMID]       INT             NULL,
    [bHided]         BIT             DEFAULT ((0)) NULL,
    [bDel]           BIT             DEFAULT ((0)) NULL,
    [bChild]         BIT             DEFAULT ((0)) NULL,
    [ID]             INT             NULL,
    CONSTRAINT [PK_Class_CID] PRIMARY KEY CLUSTERED ([CID] ASC) WITH (FILLFACTOR = 80),
    CONSTRAINT [FK_Class_OwnerMID] FOREIGN KEY ([OwnerMID]) REFERENCES [dbo].[Member] ([MID]),
    CONSTRAINT [FK_Class_Type] FOREIGN KEY ([Type]) REFERENCES [dbo].[Entity] ([EID]),
    CONSTRAINT [UQ_Class_IDPath] UNIQUE NONCLUSTERED ([IDPath] ASC) WITH (FILLFACTOR = 80),
    CONSTRAINT [UQ_Class_NamePath] UNIQUE NONCLUSTERED ([NamePath] ASC) WITH (FILLFACTOR = 80)
);








GO
EXECUTE sp_addextendedproperty @name = N'DS_Class_', @value = N'', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Class';


GO
EXECUTE sp_addextendedproperty @name = N'DS_Class_nObject', @value = N'記錄此目錄下有多少個物件', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Class', @level2type = N'COLUMN', @level2name = N'nObject';


GO
EXECUTE sp_addextendedproperty @name = N'DS_Class_nClick', @value = N'目錄點選 (click) 次數，預設值為0', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Class', @level2type = N'COLUMN', @level2name = N'nClick';


GO
EXECUTE sp_addextendedproperty @name = N'DS_Class_Keywords', @value = N'', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Class', @level2type = N'COLUMN', @level2name = N'Keywords';


GO
EXECUTE sp_addextendedproperty @name = N'DS_Class_bHided', @value = N'是否被隱藏，預設值為0 (0: 顯示，1: 隱藏)', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Class', @level2type = N'COLUMN', @level2name = N'bHided';


GO
EXECUTE sp_addextendedproperty @name = N'DS_Class_bDel', @value = N'是否被刪除，預設值為0 (0: 未刪除，1: 刪除)', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Class', @level2type = N'COLUMN', @level2name = N'bDel';


GO
EXECUTE sp_addextendedproperty @name = N'DS_Class_bChild', @value = N'是否有子目錄，預設值為0 (0: 無，1: 有)', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Class', @level2type = N'COLUMN', @level2name = N'bChild';

