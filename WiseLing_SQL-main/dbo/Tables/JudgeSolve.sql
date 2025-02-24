CREATE TABLE [dbo].[JudgeSolve] (
    [JSID]       INT            IDENTITY (1, 1) NOT NULL,
    [PID]        INT            NOT NULL,
    [SID]        INT            NOT NULL,
    [OwnerMID]   INT            NOT NULL,
    [PLID]       INT            NULL,
    [RunTime]    INT            NULL,
    [Memory]     INT            NULL,
    [JKID]       INT            NOT NULL,
    [ErrMessage] NVARCHAR (MAX) NULL,
    [bAccept]    BIT            NULL,
    [Since]      DATETIME       DEFAULT (getdate()) NULL,
    [bDel]       BIT            DEFAULT ((0)) NULL,
    [bFile]      BIT            DEFAULT ((0)) NULL,
    CONSTRAINT [PK_JudgeSolve_JSID] PRIMARY KEY CLUSTERED ([JSID] ASC),
    CONSTRAINT [FK_JudgeSolve_JKID] FOREIGN KEY ([JKID]) REFERENCES [dbo].[JudgeKind] ([JKID]),
    CONSTRAINT [FK_JudgeSolve_OwnerMID] FOREIGN KEY ([OwnerMID]) REFERENCES [dbo].[Member] ([MID]),
    CONSTRAINT [FK_JudgeSolve_PID] FOREIGN KEY ([PID]) REFERENCES [dbo].[Problem] ([PID]),
    CONSTRAINT [FK_JudgeSolve_PLID] FOREIGN KEY ([PLID]) REFERENCES [dbo].[Object] ([OID]),
    CONSTRAINT [FK_JudgeSolve_SID] FOREIGN KEY ([SID]) REFERENCES [dbo].[Solution] ([SID])
);



