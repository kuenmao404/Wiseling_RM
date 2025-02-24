CREATE TABLE [dbo].[Archive] (
    [AID]           INT              NOT NULL,
    [FileName]      NVARCHAR (256)   NOT NULL,
    [FileExtension] NVARCHAR (100)   NULL,
    [Keywords]      NVARCHAR (512)   DEFAULT ('') NOT NULL,
    [Lang]          TINYINT          NULL,
    [Indexable]     BIT              NULL,
    [IndexInfo]     NVARCHAR (255)   DEFAULT ('') NULL,
    [ContentLen]    INT              NULL,
    [MD5]           BINARY (16)      NOT NULL,
    [ContentType]   SMALLINT         DEFAULT ((0)) NULL,
    [UUID]          UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT [PK_Archive_AID] PRIMARY KEY CLUSTERED ([AID] ASC),
    CONSTRAINT [FK_Archive_AID] FOREIGN KEY ([AID]) REFERENCES [dbo].[Object] ([OID]),
    CONSTRAINT [FK_Archive_CTID] FOREIGN KEY ([ContentType]) REFERENCES [dbo].[ContentType] ([CTID]),
    CONSTRAINT [UQ_Archive_MD5] UNIQUE NONCLUSTERED ([MD5] ASC),
    CONSTRAINT [UQ_Archive_UUID] UNIQUE NONCLUSTERED ([UUID] ASC)
);








GO


