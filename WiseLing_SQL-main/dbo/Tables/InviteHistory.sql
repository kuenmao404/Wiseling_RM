CREATE TABLE [dbo].[InviteHistory] (
    [IID]         INT              IDENTITY (1, 1) NOT NULL,
    [CourseCID]   INT              NOT NULL,
    [GID]         INT              NOT NULL,
    [InviteMID]   INT              NOT NULL,
    [Token]       UNIQUEIDENTIFIER NOT NULL,
    [EMail]       NVARCHAR (MAX)   NULL,
    [SendEMailOK] BIT              DEFAULT ((0)) NULL,
    [Since]       DATETIME         DEFAULT (getdate()) NULL,
    [ExpiredDT]   DATETIME         NULL,
    [ActiveMID]   INT              NULL,
    [ActiveDate]  DATETIME         NULL,
    [bActive]     BIT              DEFAULT ((0)) NULL,
    [GroupCID]    INT              NULL,
    [bDel]        BIT              DEFAULT ((0)) NULL,
    CONSTRAINT [PK_InviteHistory] PRIMARY KEY CLUSTERED ([IID] ASC),
    CONSTRAINT [FK_InviteHistory_CourseCID] FOREIGN KEY ([CourseCID]) REFERENCES [dbo].[Class] ([CID]),
    CONSTRAINT [FK_InviteHistory_GroupCID] FOREIGN KEY ([GroupCID]) REFERENCES [dbo].[Class] ([CID]),
    CONSTRAINT [FK_InviteHistory_InviteMID] FOREIGN KEY ([InviteMID]) REFERENCES [dbo].[Member] ([MID]),
    CONSTRAINT [UQ_InviteHistory_Token] UNIQUE NONCLUSTERED ([Token] ASC)
);

