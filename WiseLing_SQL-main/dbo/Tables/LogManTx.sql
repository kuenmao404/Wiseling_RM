CREATE TABLE [dbo].[LogManTx] (
    [LID]           INT            IDENTITY (1, 1) NOT NULL,
    [SID]           INT            NOT NULL,
    [Method]        NVARCHAR (512) NULL,
    [DataOperation] BIT            NULL,
    [PID]           INT            NOT NULL,
    [VisitDate]     DATETIME       DEFAULT (getdate()) NOT NULL,
    [AID]           INT            NULL,
    CONSTRAINT [PK_LogManTx_LID] PRIMARY KEY CLUSTERED ([LID] ASC),
    CONSTRAINT [FK_LogManTx_PID] FOREIGN KEY ([PID]) REFERENCES [dbo].[PS] ([PID])
);








GO



GO



GO



GO



GO



GO



GO


