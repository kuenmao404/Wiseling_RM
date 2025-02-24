import api from '../../lib/api'

// 取得留言 vd_Comment_Pub
export const getVideoComment = async (data) => {
  const response = await api({ method: "GET", cmd: `api/Comment/${data?.oid}`, data: { ...data } })
  return response
}

// 取子留言 vd_CommentChild_Pub
export const getVideoCommentChild = async (data) => {
  const response = await api({ method: "GET", cmd: `api/Comment/${data?.oid}/${data?.pcid}`, data: { ...data } })
  return response
}

// 新增討論 xp_insertComment pcid：回覆的父討論id，若最為上層傳null
export const addVideoComment = async (data) => {
  const response = await api({ method: "POST", cmd: "api/TX/C774E7D4-5080-4954-9633-FCF0DFA9033C", data: { ...data } })
  return response
}

// 編輯討論 xp_updateComment { cid, oid, text }
export const editVideoComment = async (data) => {
  const response = await api({ method: "PUT", cmd: "api/TX/E687EB60-A72A-40ED-B25A-D1A3E062F983", data: { ...data } })
  return response
}

// 刪除討論 xp_deleteComment { pcid, cid, oid (影片|題目) }
export const delVideoComment = async (data) => {
  const response = await api({ method: "DELETE", cmd: "api/TX/C774E7D4-5080-4954-9633-FCF0DFA9033C", data: { ...data } })
  return response
}

// 討論案讚或最佳子討論 xp_likeORbestComment { pcid, cid, mode (like | best) }
export const feedbackComment = async (data) => {
  const response = await api({ method: "POST", cmd: "api/TX/7ECF23A5-369C-457B-BABE-6B43023D25C5", data: { ...data } })
  return response
}
