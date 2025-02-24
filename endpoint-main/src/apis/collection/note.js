import api from '../../lib/api'

// 取得會員隨選播放清單
export const getNoteListClass = async (data = {}) => {
  const response = await api({ method: "GET", cmd: "api/Tx/44766761-3F32-42E4-9924-8F3736D90CFE", data: { order: 'rank_a', ...data } })
  return response
}

// 新增會員隨選播放清單
export const addNoteListClass = async (data = {}) => {
  const response = await api({ method: "POST", cmd: "api/Tx/44766761-3F32-42E4-9924-8F3736D90CFE", data: { ...data } })
  return response
}

// 編輯會員隨選播放清單
export const editNoteListClass = async (data = {}) => {
  const response = await api({ method: "PUT", cmd: "api/Tx/44766761-3F32-42E4-9924-8F3736D90CFE", data: { ...data } })
  return response
}

// 刪除會員隨選播放清單
export const delNoteListClass = async (data = {}) => {
  const response = await api({ method: "DELETE", cmd: "api/Tx/44766761-3F32-42E4-9924-8F3736D90CFE", data: { ...data } })
  return response
}

// 排序會員隨選播放清單
export const sortNoteListClass = async (data = {}) => {
  const response = await api({ method: "PUT", cmd: "api/Tx/D4FAF4D6-727C-4E5B-8D03-AC4CA18BEB79", data: { ...data } })
  return response
}

/** ------------------------------------------------------------------ */

// 取得隨選播放清單筆記
export const getNoteListNote = async (data = {}) => {
  const response = await api({ method: "GET", cmd: "api/Public/E52A72F0-5614-4022-8BC7-4160D2F69E1F", data: { order: 'rank_a', ...data } })
  return response
}

// 隨選播放清單筆記本+ (搜尋用)
export const getMemberNoteAdd = async (data = {}) => {
  const response = await api({ method: "GET", cmd: "api/Member/PList", data: { ...data } })
  return response
}

// 取得個人筆記 (用於隨選播放清單頁面+)
export const getMemberNote = async (data = {}) => {
  const response = await api({ method: "GET", cmd: "api/Tx/D5E3C030-2E91-403D-B8F4-1EB232867445", data: { order: 'startTime_a', ...data } })
  return response
}

// 新增隨選播放清單筆記
export const addNoteListNote = async (data = {}) => {
  const response = await api({ method: "POST", cmd: "api/Tx/D5E3C030-2E91-403D-B8F4-1EB232867445", data: { ...data } })
  return response
}

// 排序隨選播放清單筆記
export const sortNoteListNote = async (data = {}) => {
  const response = await api({ method: "PUT", cmd: "api/Tx/D5E3C030-2E91-403D-B8F4-1EB232867445", data: { ...data } })
  return response
}

// 刪除隨選播放清單筆記
export const delNoteListNote = async (data = {}) => {
  const response = await api({ method: "DELETE", cmd: "api/Tx/D5E3C030-2E91-403D-B8F4-1EB232867445", data: { ...data } })
  return response
}