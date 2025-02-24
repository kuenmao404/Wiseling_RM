CREATE TABLE [dbo].[EntityM2DC] (
    [EID]       SMALLINT       NOT NULL,
    [Field]     NVARCHAR (64)  NOT NULL,
    [Caption]   NVARCHAR (128) NULL,
    [JSONField] NVARCHAR (64)  NULL,
    [DCField]   TINYINT        NULL,
    [SNo]       TINYINT        NULL,
    CONSTRAINT [PK_EntityM2DC] PRIMARY KEY CLUSTERED ([EID] ASC, [Field] ASC),
    FOREIGN KEY ([EID]) REFERENCES [dbo].[Entity] ([EID])
);

