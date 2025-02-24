CREATE TABLE [dbo].[Object] (
    [OID]            INT             IDENTITY (1, 1) NOT NULL,
    [Type]           SMALLINT        NOT NULL,
    [CName]          NVARCHAR (512)  NULL,
    [CDes]           NVARCHAR (4000) NULL,
    [EName]          NVARCHAR (512)  NULL,
    [EDes]           NVARCHAR (4000) NULL,
    [Since]          DATETIME        DEFAULT (getdate()) NOT NULL,
    [LastModifiedDT] DATETIME        DEFAULT (getdate()) NOT NULL,
    [OtherDT]        DATETIME        NULL,
    [DataByte]       BINARY (1)      NULL,
    [OwnerMID]       INT             NULL,
    [nClick]         INT             DEFAULT ((0)) NOT NULL,
    [nOutlinks]      INT             NULL,
    [nInlinks]       INT             NULL,
    [bHided]         BIT             DEFAULT ((0)) NULL,
    [bDel]           BIT             DEFAULT ((0)) NULL,
    CONSTRAINT [PK_Object_OID] PRIMARY KEY CLUSTERED ([OID] ASC),
    CONSTRAINT [FK_Object_OwnerMID] FOREIGN KEY ([OwnerMID]) REFERENCES [dbo].[Member] ([MID])
);


GO
CREATE NONCLUSTERED INDEX [IX_Object_CName]
    ON [dbo].[Object]([CName] ASC);

