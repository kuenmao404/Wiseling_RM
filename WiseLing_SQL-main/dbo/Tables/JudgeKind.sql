CREATE TABLE [dbo].[JudgeKind] (
    [JKID] INT            IDENTITY (1, 1) NOT NULL,
    [Kind] NVARCHAR (255) NULL,
    [Type] INT            NULL,
    CONSTRAINT [PK_JudgeKind_JKID] PRIMARY KEY CLUSTERED ([JKID] ASC),
    CONSTRAINT [UQ_JudgeKind_ErrKind] UNIQUE NONCLUSTERED ([Kind] ASC)
);

