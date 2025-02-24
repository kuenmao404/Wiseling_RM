CREATE   procedure [dbo].[xp_insertArchive]
	@CID int,
	@MID int,
	@FileName nvarchar(255),
	@FileExtension nvarchar(100),
	@ContentLen int,
	@ContentType nvarchar(100),
	@uuid uniqueidentifier,
	@bDel int,  
	@sid int,
	@NewOID int output,
	@outuuid uniqueidentifier output,
	@status bit output,
	@message nvarchar(max) output
as
begin 
	set xact_abort on
	declare @aid int = (select AID from Action where EName = (select object_name(@@procid)))
	begin try 
		set @status = 0
		set @message = '上傳失敗'
		set @NewOID = -1
		set @outuuid = null

		set @uuid = isnull(@uuid, newid())

		if (@cid is not null and not exists(select * from Class where CID = @cid and bDel = 0)) begin
			set @message = '檔案ID不符'
			return
		end

		declare @EID int = (select EID from Entity where EName ='Archive' )
			
		if(@EID is null ) return ;
		
		begin transaction [xp_insertArchive]
            
			declare @CTID int

			exec xp_insertContentType @ContentType, @FileExtension, @CTID output

			insert into Object (Type,CName,OwnerMID, DataByte, bDel) values (@EID, @FileName, @MID, iif(@cid is null, 0, 1), @bDel) 
			set @NewOID =SCOPE_IDENTITY() 

			declare @id nvarchar(8) = convert(varchar,convert(varbinary, @NewOID), 2)
			declare @path nvarchar(900) =  substring(@id, 1, 2)  + '/' + substring(@id, 3, 2) + '/' + substring(@id, 5, 2) + '/' + substring(@id, 7, 2)
			
			insert into Archive(AID, ContentLen, ContentType, FileName, FileExtension, MD5, UUID)
				values(@NewOID, @ContentLen, @CTID, @FileName, @FileExtension, hashbytes('MD5', @path), @uuid)


			if(@cid is not null) begin
				insert into CO(CID, OID)
					values(@CID, @NewOID)

				insert into OC(CID, OID)
					values(@CID, @NewOID)
			end
	
			update Object set CDes = @path, EName = 'UUID=' + cast(@uuid as nvarchar(250)) where OID = @NewOID

			set @outuuid = @uuid
			set @status = 1
			set @message = '上傳成功'
		commit transaction [xp_insertArchive]
	end try
	begin catch
		if XACT_STATE() <> 0
		begin
			rollback transaction [xp_insertArchive]
		end
		declare @ErrorMessage As VARCHAR(1000) = CHAR(10)+'錯誤代碼：' +CAST(ERROR_NUMBER() AS VARCHAR)
												+CHAR(10)+'錯誤訊息：'+	ERROR_MESSAGE()
												+CHAR(10)+'錯誤行號：'+	CAST(ERROR_LINE() AS VARCHAR)
												+CHAR(10)+'錯誤程序名稱：'+	ISNULL(ERROR_PROCEDURE(),'')
		declare @ErrorSeverity As Numeric = ERROR_SEVERITY()
		declare @ErrorState As Numeric = ERROR_STATE()
		declare @err_number int = ERROR_NUMBER()

		exec xp_insertLogErr @sid, @ErrorMessage, @err_number, @aid
	
		RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);--回傳錯誤資訊
	end catch
	set xact_abort off
end