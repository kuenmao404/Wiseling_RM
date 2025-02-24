CREATE   procedure [dbo].[xp_extended_properties_SL]
	@name nvarchar(255),
	@column  nvarchar(255),
	@sl nvarchar(10)  -- 0 紀錄, 1: md5, 2: 不紀錄 
as
begin
	set xact_abort on --指定當 Transact-SQL 陳述式產生執行階段錯誤時，SQL Server 是否自動回復目前的交易
	begin try

		declare @type nvarchar(10), @object_id int, @message nvarchar(max)
		
		select @type = type, @object_id = object_id from sys.objects where name = @name

		if(@type is null) begin
			set @message = 'Error: 找不到Table、Function、SP、View；參數@name：' + @name
			raiserror(@message, 14, 1)
			return
		end
		
		declare @column_id int 

		if @type not in('V', 'U', 'FN', 'TF', 'P') begin
			set @message = '未知type'
			raiserror(@message, 14, 1)
			return
		end
		if (@type in('V', 'U')) begin
		
			select @column_id = column_id, @column = name 
			from sys.all_columns
			where object_id = @object_id and name = @column
		end
		else begin
			select @column_id = parameter_id, @column = name 
			from sys.parameters
			where object_id = @object_id and name = @column
		end

		if(@column_id is null) begin
			set @message = '參數@column：' + @column + ' 不存在，若是SP，Fn請加上@'
			raiserror(@message, 14, 1)
			return
		end

		declare @des_name nvarchar(255) = 'DS_SL_' +  @name + '_' + @column

		
		if(@sl not in ('0', '1', '2')) begin
			set @message = '參數@sl不合法 0: 紀錄, 1: md5, 2: 不紀錄'
			raiserror(@message, 14, 1)
			return
		end

		declare @level1type nvarchar(255), @level2type nvarchar(255) 

		set @level1type =
			case @type
				when 'FN' then 'FUNCTION'
				when 'TF' then 'FUNCTION'
				when 'P' then 'PROCEDURE'
				when 'V' then 'VIEW'
				when 'U' then 'TABLE'
				else null
			end

		set @level2type =
			case @type
				when 'FN' then 'PARAMETER'
				when 'TF' then 'PARAMETER'
				when 'P' then 'PARAMETER'
				when 'V' then 'COLUMN'
				when 'U' then 'COLUMN'
				else null
			end

		if(@level1type is null or @level2type is null) begin
			set @message = '未知leveltype'
			raiserror(@message, 14, 1)
			return
		end
		begin transaction　[xp_extended_properties_SL]

			if not exists(select * from sys.extended_properties where major_id = @object_id and name = @des_name)
			begin
				exec sp_addextendedproperty @des_name, @sl, 'SCHEMA', 'dbo', @level1type, @name, @level2type, @column
			end
			else 
			begin
				exec sp_updateextendedproperty @des_name, @sl, 'SCHEMA', 'dbo', @level1type, @name, @level2type, @column
			end

			
		commit transaction	[xp_extended_properties_SL]
	end try
	begin catch
		if XACT_STATE() <> 0 rollback transaction [xp_extended_properties_SL]
		declare @ErrorMessage As VARCHAR(1000) = CHAR(10)+'錯誤代碼：' +CAST(ERROR_NUMBER() AS VARCHAR)
										+CHAR(10)+'錯誤訊息：'+	ERROR_MESSAGE()
										+CHAR(10)+'錯誤行號：'+	CAST(ERROR_LINE() AS VARCHAR)
										+CHAR(10)+'錯誤程序名稱：'+	ISNULL(ERROR_PROCEDURE(),'')
		declare @ErrorSeverity As Numeric = ERROR_SEVERITY()
		declare @ErrorState As Numeric = ERROR_STATE()
		declare @err_number int = ERROR_NUMBER()

		RAISERROR( @ErrorMessage, @ErrorSeverity, @ErrorState);--回傳錯誤資訊
	end catch
	set xact_abort off
end