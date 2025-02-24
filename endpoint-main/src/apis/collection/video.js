import api from '../../lib/api'

// 取得個人影片收藏
export const getVideoListClass = async (data = {}) => {
  const response = await api({ method: "GET", cmd: "api/Tx/E55A3B41-61CB-4A90-A6AA-04A9EA7E7AFD", data: { order: 'rank_a', ...data } })
  return response
}

// 新增個人影片收藏
export const addVideoListClass = async (data = {}) => {
  const response = await api({ method: "POST", cmd: "api/Tx/E55A3B41-61CB-4A90-A6AA-04A9EA7E7AFD", data: { ...data } })
  return response
}

// 編輯個人影片收藏
export const editVideoListClass = async (data = {}) => {
  const response = await api({ method: "PUT", cmd: "api/Tx/E55A3B41-61CB-4A90-A6AA-04A9EA7E7AFD", data: { ...data } })
  return response
}

// 刪除個人影片收藏
export const delVideoListClass = async (data = {}) => {
  const response = await api({ method: "DELETE", cmd: "api/Tx/E55A3B41-61CB-4A90-A6AA-04A9EA7E7AFD", data: { ...data } })
  return response
}

// 排序個人影片收藏
export const sortVideoListClass = async (data = {}) => {
  const response = await api({ method: "PUT", cmd: "api/Tx/314D5063-E0FA-42FC-ABE9-A1E30CEFA61E", data: { ...data } })
  return response
}

/* ------------------------------------------------------------------ **/

// 取得影片收藏清單內段落與影片
export const getVideoListParagraphVideo = async (data = {}) => {
  const response = await api({ method: "GET", cmd: "api/Public/16944CF0-AA02-48AC-A65C-966908F8C03F", data: { order: 'cRank_a,rank_a', ...data } })
  return response
}

// 取得影片收藏段落
export const getVideoListParagraph = async (data = {}) => {
  const response = await api({ method: "GET", cmd: "api/Public/F232BFC3-8552-4F37-BC25-8C4E1140B063", data: { order: 'rank_a', ...data } })
  return response
}

// 新增影片收藏段落
export const addVideoListParagraph = async (data = {}) => {
  const response = await api({ method: "POST", cmd: "api/Tx/08C1633C-D03C-4864-92BA-1C331C1F9C74", data: { ...data } })
  return response
}

// 編輯影片收藏段落
export const editVideoListParagraph = async (data = {}) => {
  const response = await api({ method: "PUT", cmd: "api/Tx/08C1633C-D03C-4864-92BA-1C331C1F9C74", data: { ...data } })
  return response
}

// 刪除影片收藏段落
export const delVideoListParagraph = async (data = {}) => {
  const response = await api({ method: "DELETE", cmd: "api/Tx/08C1633C-D03C-4864-92BA-1C331C1F9C74", data: { ...data } })
  return response
}

// 排序影片收藏段落
export const sortVideoListParagraph = async (data = {}) => {
  const response = await api({ method: "PUT", cmd: "api/Tx/255F199D-7DF9-4C82-9FB0-94D47C158C18", data: { ...data } })
  return response
}

/** ------------------------------------------------------------------ */

// 新增影片至收藏清單
export const addVideoListVideo = async (data = {}) => {
  const response = await api({ method: "POST", cmd: `api/Video/Paragraph/${data?.cid}`, data: { ...data } })
  return response
}

// 排序收藏清單影片
export const sortVideoListVideo = async (data = {}) => {
  const response = await api({ method: "PUT", cmd: "api/Tx/57A4C0CC-9BB6-4281-9D5D-2B988A852205", data: { ...data } })
  return response
}

// 刪除收藏清單影片
export const delVideoListVideo = async (data = {}) => {
  const response = await api({ method: "DELETE", cmd: "api/Tx/57A4C0CC-9BB6-4281-9D5D-2B988A852205", data: { ...data } })
  return response
}