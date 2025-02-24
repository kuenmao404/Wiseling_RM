import api from "../lib/api"

// 取得notebook
export const getMyNotebook = async (data = {}) => {
  const response = await api({ method: "GET", cmd: "api/Tx/A1E5181A-8371-4541-B326-1A64864D3AC2", data: { ...data } })
  return response
}

// 取得個人影片的筆記本分類 { }
export const getNoteClass = async (data = {}) => {
  const response = await api({ method: "GET", cmd: "api/Public/12A48628-CB95-4A48-9341-067718DEF204", data: { ...data } })
  return response
}

// 取得個人影片筆記本分類的筆記
export const getNotes = async (data = {}) => {
  const response = await api({ method: "GET", cmd: "api/Tx/52FA71E9-E8FA-4809-8B2F-DE381B6B9C49", data: { order: "startTime_a", ...data } })
  return response
}

// 新增筆記 { vid, cid, startTime, endTime }
export const addNote = async (data = {}) => {
  const response = await api({ method: "POST", cmd: "api/Tx/52FA71E9-E8FA-4809-8B2F-DE381B6B9C49", data: { ...data } })
  return response
}

// 編輯筆記 { vid, cid, nid, startTime, endTime }
export const editNote = async (data = {}) => {
  const response = await api({ method: "PUT", cmd: "api/Tx/52FA71E9-E8FA-4809-8B2F-DE381B6B9C49", data: { ...data } })
  return response
}

// 刪除筆記 { vid, cid, nid }
export const delNote = async (data = {}) => {
  const response = await api({ method: "DELETE", cmd: "api/Tx/52FA71E9-E8FA-4809-8B2F-DE381B6B9C49", data: { ...data } })
  return response
}

// 新增筆記本 { vid, cname }
export const addNoteClass = async (data = {}) => {
  const response = await api({ method: "POST", cmd: "api/Tx/DD5E2D86-944A-485D-B5B4-D51AFCFA3D2E", data: { ...data } })
  return response
}

// 編輯筆記本 { vid, cname, cid }
export const editNoteClass = async (data = {}) => {
  const response = await api({ method: "PUT", cmd: "api/Tx/DD5E2D86-944A-485D-B5B4-D51AFCFA3D2E", data: { ...data } })
  return response
}

// 刪除筆記本 { vid, cname, cid }
export const delNoteClass = async (data = {}) => {
  const response = await api({ method: "DELETE", cmd: "api/Tx/DD5E2D86-944A-485D-B5B4-D51AFCFA3D2E", data: { ...data } })
  return response
}