CREATE TABLE [dbo].[Member] (
    [MID]           INT            NOT NULL,
    [Account]       VARCHAR (512)  NOT NULL,
    [PWD]           VARCHAR (300)  NULL,
    [Valid]         BIT            NULL,
    [EMail]         NVARCHAR (255) NOT NULL,
    [Status]        TINYINT        NULL,
    [LoginCount]    INT            DEFAULT ((0)) NOT NULL,
    [LastLoginDT]   DATETIME       NULL,
    [LoginErrCount] TINYINT        DEFAULT ((0)) NOT NULL,
    [VerifyCode]    VARCHAR (300)  NULL,
    [ClassID]       INT            NULL,
    [Sex]           BIT            NULL,
    [Birthday]      SMALLDATETIME  NULL,
    [Nation]        SMALLINT       NULL,
    [Address]       NVARCHAR (200) NULL,
    [Phone]         NVARCHAR (25)  NULL,
    [SendEMailOK]   BIT            NULL,
    [bPrev]         BIT            DEFAULT ((0)) NULL,
    [NickName]      NVARCHAR (20)  NULL,
    CONSTRAINT [PK_Member] PRIMARY KEY CLUSTERED ([MID] ASC) WITH (FILLFACTOR = 80),
    CONSTRAINT [FK_Member_ClassID] FOREIGN KEY ([ClassID]) REFERENCES [dbo].[Class] ([CID]),
    CONSTRAINT [FK_Member_MID] FOREIGN KEY ([MID]) REFERENCES [dbo].[Object] ([OID]),
    CONSTRAINT [FK_Member_Nation] FOREIGN KEY ([Nation]) REFERENCES [dbo].[Nation] ([NID]),
    CONSTRAINT [UQ_Member_Account] UNIQUE NONCLUSTERED ([Account] ASC) WITH (FILLFACTOR = 80)
);










GO
CREATE NONCLUSTERED INDEX [IX_Member_Account]
    ON [dbo].[Member]([Account] ASC);

