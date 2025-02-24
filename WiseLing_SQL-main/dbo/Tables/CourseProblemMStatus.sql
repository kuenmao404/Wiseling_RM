CREATE TABLE [dbo].[CourseProblemMStatus] (
    [CID]             INT      NOT NULL,
    [PID]             INT      NOT NULL,
    [MID]             INT      NOT NULL,
    [bAccept]         BIT      CONSTRAINT [DF_CourseProblemMStatus_bAccept] DEFAULT ((0)) NULL,
    [Since]           DATETIME CONSTRAINT [DF_CourseProblemMStatus_Since] DEFAULT (getdate()) NULL,
    [LastModifiedDT]  DATETIME CONSTRAINT [DF_CourseProblemMStatus_LastModifiedDT] DEFAULT (getdate()) NULL,
    [AcceptSince]     DATETIME NULL,
    [JSID]            INT      NOT NULL,
    [nSubmit]         INT      CONSTRAINT [DF_CourseProblemMStatus_nSubmit] DEFAULT ((0)) NULL,
    [nFirstAccSubmit] INT      NULL,
    CONSTRAINT [PK_CourseProblemMStatus] PRIMARY KEY CLUSTERED ([CID] ASC, [PID] ASC, [MID] ASC),
    CONSTRAINT [FK_CourseProblemMStatus_CID] FOREIGN KEY ([CID]) REFERENCES [dbo].[Class] ([CID]),
    CONSTRAINT [FK_CourseProblemMStatus_JSID] FOREIGN KEY ([JSID]) REFERENCES [dbo].[JudgeSolve] ([JSID]),
    CONSTRAINT [FK_CourseProblemMStatus_MID] FOREIGN KEY ([MID]) REFERENCES [dbo].[Member] ([MID]),
    CONSTRAINT [FK_CourseProblemMStatus_PID] FOREIGN KEY ([PID]) REFERENCES [dbo].[Problem] ([PID])
);





