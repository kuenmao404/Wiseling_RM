import api from '../lib/api'

export const getAccount = async () => {
  const response = await api({ method: "GET", cmd: "api/Member" })
  return response
}

export const logoutAccount = async () => {
  const response = await api({ method: "POST", cmd: "api/Auth/logout" })
  return response
}

export const getPersonClass = async (data) => {
  const response = await api({ method: "GET", cmd: "api/TX", data: { ...data, uuid: "22AD64DE-F491-4FC1-A3A6-F1FC6C401F25" } })
  return response
}

// 會員馬賽克磚內容 (點選方塊)，vd_MemberCalendarHeatMap
export const getMemberHeatMapDetail = async (data) => {
  const response = await api({ method: "GET", cmd: "api/TX/45478B23-5CB1-4AE8-B5C1-045CA1B28A34", data: { order: "since_d", ...data } })
  return response
}

// 會員回報問題
export const reportError = async (data) => {
  const response = await api({ method: "POST", cmd: "api/Report", data: { ...data } })
  return response
}


// 會員馬賽克專觀看紀錄 vd_MemberWatchHistoryMap
export const getVideoHistoryHeatMap = async (data) => {
  const response = await api({ method: "GET", cmd: "api/Tx/28032037-FCEF-49F0-B7CD-252258C4CB1E", data: { ...data } })
  return response
}