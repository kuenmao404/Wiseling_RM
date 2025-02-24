import api from '../lib/api'

export const searchVideo = async (data) => {
  const response = await api({
    method: "GET",
    cmd: "api/Public/31C95248-479E-4F29-B140-34E886D57EBA",
    data: { ...data, like_column: "title", bTotal: true, order: "viewCount_d" }
  })
  return response
}

export const getVideoInfo = async (data) => {
  const response = await api({
    method: "GET",
    cmd: "api/Public/31C95248-479E-4F29-B140-34E886D57EBA",
    data: { ...data, first: true }
  })
  return response
}

// 紀錄觀看紀錄 { vid }
export const setVideoHistory = async (data) => {
  const response = await api({
    method: "POST",
    cmd: "api/Tx/08D3FDD9-2123-4B72-90A9-BB711E2593E9",
    data: { ...data }
  })
  return response
}

// 紀錄影片最後觀看時間 { vid, second }
export const setVideoLastSec = async (data) => {
  const response = await api({
    method: "PUT",
    cmd: "api/Tx/08D3FDD9-2123-4B72-90A9-BB711E2593E9",
    data: { ...data }
  })
  return response
}

// 取得個人觀看紀錄
export const getVideoHistory = async (data = {}) => {
  const response = await api({
    method: "GET",
    cmd: "api/Tx/08D3FDD9-2123-4B72-90A9-BB711E2593E9",
    data: { order: "since_d", ...data }
  })
  return response
}

// 課程章節影片+
export const searchCourseVideo = async (data = {}) => {
  const response = await api({
    method: "GET",
    cmd: `api/Course/Chapter/${data?.cid}`,
    data: { ...data }
  })
  return response
}

// 新增YT影片
export const addYTVideo = async (data = {}) => {
  const response = await api({ method: "POST", cmd: "api/Video/Youtube", data: { ...data } })
  return response
}