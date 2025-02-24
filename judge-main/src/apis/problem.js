import api from '../lib/api'

// 新增題目
export const createProblem = async (data) => {
  const response = await api({ method: "POST", cmd: "api/Tx/5D59FB1B-C0EB-4E7E-B74B-23D2AD081D1C", data: { ...data } })
  return response
}

export const getJudgeRoot = async (data) => {
  const response = await api({ method: "GET", cmd: "api/Public/07279869-3336-4358-97F5-14E533D423E1", data: { first: true, ...data } })
  return response
}

// 取得題目 vd_ProblemTag_Pub
export const getProblems = async (data) => {
  const response = await api({ method: "GET", cmd: "api/Public/CA5610E5-6E54-425F-A657-B7B5FDDE1F8A", data: { ...data } })
  return response
}

// 取得一筆題目內容
export const getProblem = async (data) => {
  const response = await api({ method: "GET", cmd: "api/Public/16C985DA-81F1-4A33-A7C8-910A238D3DA7", data: { first: true, ...data } })
  return response
}

// 回報題目錯誤
export const sendErrorReport = async (data) => {
  const response = await api({ method: "POST", cmd: "api/Report", data: { ...data } })
  return response
}

// Judge題目後台目錄
export const getProblemBackSide = async (data) => {
  const response = await api({ method: "GET", cmd: `api/Problem/BackSide/${data?.pid}` })
  return response
}

// Judge 解題submit
export const submitProblem = async (data) => {
  const response = await api({ method: "POST", cmd: `api/Problem/${data?.pid}`, fileObj: { ...data } })
  return response
}

// Judge提交紀錄 vd_JudgeSolve
export const getProblemSolveHistory = async (data) => {
  const response = await api({ method: "GET", cmd: `api/Tx/76AF9E43-0402-4567-8EA7-BA75835DF47C`, data: { ...data } })
  return response
}

// 取得我的解題紀錄的程式碼 vd_JudgeSolveSolution
export const getSolveHistoryCode = async (data) => {
  const response = await api({ method: "GET", cmd: `api/Tx/7AAF64DF3-465F-4CC7-A710-94E1029D1148`, data: { first: true, ...data } })
  return response
}

// 上傳範例程式 vd_ClassProblemSolution
export const updateProblemSolution = async ({ pid, ...data }) => {
  const response = await api({ method: "PUT", cmd: `api/Problem/Solution/${pid}`, fileObj: { ...data } })
  return response
}

// 成功上傳的範例程式 vd_ClassProblemSolution
export const getProblemSolution = async (data) => {
  const response = await api({ method: "GET", cmd: `api/Tx/88551878-1779-4775-A220-4F13020C5EFD`, data: { first: true, order: "since_d", top: 1, ...data } })
  return response
}

// 上傳測資 vd_ClassProblemSolution
export const updateProblemTestCase = async ({ pid, ...data }) => {
  const response = await api({ method: "POST", cmd: `api/Problem/TestCase/${pid}`, fileObj: { ...data } })
  return response
}

// 刪除測資 vd_ClassProblemSolution
export const delProblemTestCase = async ({ pid, ...data }) => {
  const response = await api({ method: "DELETE", cmd: `api/Problem/TestCase/${pid}`, data: { ...data } })
  return response
}

// 取得測資 vd_ClassProblemTestCase
export const getProblemTestCase = async (data) => {
  const response = await api({ method: "GET", cmd: `api/Tx/2E6B7B4C-CF11-42D4-B707-7EADC5546C1D`, data: { order: "rank_a", ...data } })
  return response
}

// 取得Judge系統支援程式語言
export const getSupportLanguage = async (data) => {
  const response = await api({ method: "GET", cmd: `api/Public/4B34AB93-A6EA-4F0F-83E4-5B98C7DCC6BE`, data: { ...data } })
  return response
}

// 取得討論區貼文 cid：課程討論區CID
export const getProblemForum = async ({ cid, ...data } = {}) => {
  const response = await api({ method: "GET", cmd: `api/Comment/Class/${cid}`, data: { order: "bTop_d,lastModifiedDT_d", ...data } })
  return response
}

// 新增Class Tag討論區 xp_insertClassForum&Tag { id, cid, title, text, tag }
export const addProblemForum = async (data) => {
  const response = await api({ method: "POST", cmd: `api/Tx/BAB88128-C81F-4648-9C64-9B81F077150E`, data: { ...data } })
  return response
}

// 編輯Class Tag討論區 xp_updateForum&Tag { fid, title, text, tag }
export const editProblemForum = async (data) => {
  const response = await api({ method: "PUT", cmd: `api/Tx/BAB88128-C81F-4648-9C64-9B81F077150E`, data: { ...data } })
  return response
}

// 刪除Class Tag討論區 cid：課程討論區CID { cid, pfid: "刪除子討論需傳父討論ID", fid }
export const delProblemForum = async (data = {}) => {
  const response = await api({ method: "DELETE", cmd: `api/Tx/58917D9F-034C-48AE-BB2B-D738F02FA5E6`, data: { ...data } })
  return response
}

// 取得題目子討論
export const getProblemForumChild = async ({ cid, pfid, ...data } = {}) => {
  const response = await api({ method: "GET", cmd: `api/Comment/Class/${cid}/${pfid}`, data: { order: "bBest_d,lastModifiedDT_d", ...data } })
  return response
}

// 新增題目討論區貼文 cid：課程討論區CID { cid, fid, title, text }
export const addProblemForumChild = async (data = {}) => {
  const response = await api({ method: "POST", cmd: `api/Tx/58917D9F-034C-48AE-BB2B-D738F02FA5E6`, data: { ...data } })
  return response
}

// 案讚或最佳題目討論區貼文留言 cid：題目討論區CID { cid, pfid: "like不需傳，best需傳父討論id", fid, mode: "1|2 (like|best)" }
export const likebestProblemForum = async (data = {}) => {
  const response = await api({ method: "PUT", cmd: `api/Tx/58917D9F-034C-48AE-BB2B-D738F02FA5E6`, data: { ...data } })
  return response
}
