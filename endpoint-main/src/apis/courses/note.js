import api from "../../lib/api"

// 取得課程影片教材 vd_CourseTeachVideoNote，cid：課程教材CID
export const getCourseVideoTeachNote = async (data = {}) => {
  const response = await api({ method: "GET", cmd: `api/Tx/C2BFD4DD-CAD7-49AA-9D10-BF4CFC9601B0`, data: { order: "startTime_a", ...data } })
  return response
}

// 新增課程影片教材 xp_insertTeach_Course，cid：課程教材CID
export const addCourseVideoTeachNote = async (data = {}) => {
  const response = await api({ method: "POST", cmd: `api/Tx/C2BFD4DD-CAD7-49AA-9D10-BF4CFC9601B0`, data: { ...data } })
  return response
}

// 編輯課程影片教材 xp_updateTeach_Course，cid：課程教材CID
export const editCourseVideoTeachNote = async (data = {}) => {
  const response = await api({ method: "PUT", cmd: `api/Tx/C2BFD4DD-CAD7-49AA-9D10-BF4CFC9601B0`, data: { ...data } })
  return response
}

// 刪除課程影片教材 xp_deleteTeach_Course，cid：課程教材CID
export const delCourseVideoTeachNote = async (data = {}) => {
  const response = await api({ method: "DELETE", cmd: `api/Tx/C2BFD4DD-CAD7-49AA-9D10-BF4CFC9601B0`, data: { ...data } })
  return response
}

// 取得個人筆記 (匯入課程教材) { cid: "影片教材cid", courseCID: "課程cid", vid: "影片vid" }
export const getCourseTeachImportNote = async ({ cid, ...data } = {}) => {
  const response = await api({ method: "GET", cmd: `api/Course/ImportNote/${cid}`, data: { ...data } })
  return response
}

// 個人筆記匯入課程教材 { cid: "影片教材cid", courseCID: "課程cid", vid: "影片vid", nid: "@mode = all，可傳null", mode: "single|all (單一筆記|全部匯入)" }
export const importCourseTeachNote = async ({  ...data } = {}) => {
  const response = await api({ method: "POST", cmd: `api/Tx/17635495-F12F-43FF-ADC5-90EA587D4D6D`, data: { mode: "single", ...data } })
  return response
}