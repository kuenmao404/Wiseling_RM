create procedure xps_addNewMember
	@Account nvarchar(100), @Password nvarchar(256), @UserName nvarchar(50),
	@EMail nvarchar(256), @Sex bit, @Birthday date, @Phone nvarchar(100), @Address nvarchar(256), 
	@NewMID int output
as
begin
	begin try
		if ((select count(*) from Member where Account = ltrim(rtrim(@Account))) > 0 )
		begin
			raiserror('Error: Account已存在，不可再新增', 10,1)
			return
		end

		declare	@License nvarchar(512) = (select Des from SystemConfig where Name = 'License')
		declare	@PWD nvarchar(512) = (select dbo.fs_getSHA2_512Encode(rtrim(ltrim(@Password)) + @License)),
				@Valid int = null,
				@Status int = null
		declare	@VarifyCode nvarchar(512) = (select dbo.fs_getSHA2_512Encode(@Account + @PWD + @License))

		--//add a new Object 
		insert Object(Type, CName)	values(2, @UserName)
		declare @NewOID int = (@@identity)

		--//add a new Member
		insert into Member(MID, Account, PWD, Valid, Status, VerifyCode, EMail, Sex, Birthday, Address, Phone)
			values(@NewOID, @Account, @PWD, @Valid, @Status, @VarifyCode, @EMail, @Sex, @Birthday, @Address, @Phone)

		--//add GM
		insert into GM(GID, MID, Role, Type, Status) values(2, @NewOID, 2, 1, 0)
		set @NewMID = @NewOID
	end try
	begin catch
	--系統拋回訊息用
		DECLARE @ErrorMessage As VARCHAR(1000) = CHAR(10)+'錯誤代碼：' +CAST(ERROR_NUMBER() AS VARCHAR)
												+CHAR(10)+'錯誤訊息：'+	ERROR_MESSAGE()
												+CHAR(10)+'錯誤行號：'+	CAST(ERROR_LINE() AS VARCHAR)
												+CHAR(10)+'錯誤程序名稱：'+	ISNULL(ERROR_PROCEDURE(),'')
		DECLARE @ErrorSeverity As Numeric = ERROR_SEVERITY()
		DECLARE @ErrorState As Numeric = ERROR_STATE()
		RAISERROR( @ErrorMessage, @ErrorSeverity, @ErrorState);--回傳錯誤資訊
	end catch
end