create     function [dbo].[fn_getEMailState](@sendEMailOK bit, @bActive bit, @bDel bit, @expire datetime)
	returns int
as
begin
	/*
	信件狀態：
	0：未開通
	1：已開通
	2：已到期
	3：刪除
	4：寄信失敗
	*/
	if(@sendEMailOK = 0) 
		return 4
	else if(@bDel = 1)
		return 3
	else if(@bActive = 1)
		return 1
	else if(getdate() > @expire)
		return 2
	else 
		return 0

	return null
end