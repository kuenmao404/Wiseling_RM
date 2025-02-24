import api from "../lib/api"

// 取得里程碑
export const getTimeLine = async (data = {}) => {
  const response = await api({ method: "GET", cmd: "api/Public/C33D00F9-D73C-4EEF-AEDC-7E7EB000243D", data: { order: "date_d", ...data } })
  return response
}

// 新增里程碑 xp_insertMileStone
export const addTimeLine = async (data = {}) => {
  const response = await api({ method: "POST", cmd: "api/Tx/208E8B10-E321-458D-A992-45B60C700116", data: { ...data } })
  return response
}

// 更新里程碑 xp_updateMileStone
export const editTimeLine = async (data = {}) => {
  const response = await api({ method: "PUT", cmd: "api/Tx/208E8B10-E321-458D-A992-45B60C700116", data: { ...data } })
  return response
}

// 刪除里程碑 xp_deleteMileStone
export const delTimeLine = async (data = {}) => {
  const response = await api({ method: "DELETE", cmd: "api/Tx/208E8B10-E321-458D-A992-45B60C700116", data: { ...data } })
  return response
}