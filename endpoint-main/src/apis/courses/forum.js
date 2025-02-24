import api from '../../lib/api'

// 取得課程討論區貼文 cid：課程討論區CID
export const getCourseForum = async ({ cid, ...data } = {}) => {
  const response = await api({ method: "GET", cmd: `api/Comment/Class/${cid}`, data: { order: "bTop_d,lastModifiedDT_d", ...data } })
  return response
}

// 新增課程討論區貼文 cid：課程討論區CID { cid, fid, title, text }
export const addCourseForum = async (data = {}) => {
  const response = await api({ method: "POST", cmd: `api/Tx/58917D9F-034C-48AE-BB2B-D738F02FA5E6`, data: { ...data } })
  return response
}

// 案讚或最佳課程討論區貼文留言 cid：課程討論區CID { cid, pfid: "like不需傳，best需傳父討論id", fid, mode: "1|2 (like|best)" }
export const likebestCourseForum = async (data = {}) => {
  const response = await api({ method: "PUT", cmd: `api/Tx/58917D9F-034C-48AE-BB2B-D738F02FA5E6`, data: { ...data } })
  return response
}

// 刪除課程討論區貼文 cid：課程討論區CID { cid, pfid: "刪除子討論需傳父討論ID", fid }
export const delCourseForum = async (data = {}) => {
  const response = await api({ method: "DELETE", cmd: `api/Tx/58917D9F-034C-48AE-BB2B-D738F02FA5E6`, data: { ...data } })
  return response
}

// 編輯課程討論區貼文 cid：課程討論區CID
export const editCourseForum = async (data = {}) => {
  const response = await api({ method: "PUT", cmd: `api/Tx/E687EB60-A72A-40ED-B25A-D1A3E062F983`, data: { ...data } })
  return response
}

// 取得課程子討論
export const getCourseForumChild = async ({ cid, pfid, ...data } = {}) => {
  const response = await api({ method: "GET", cmd: `api/Comment/Class/${cid}/${pfid}`, data: { order: "bBest_d,lastModifiedDT_d", ...data } })
  return response
}