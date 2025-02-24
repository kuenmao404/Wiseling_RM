import api from "../lib/api"

// POST - 轉移使用者資料
export const transferIT108 = async (data = {}) => {
  const response = await api({ method: "POST", cmd: "api/Member/Transfer/IT108", data: { ...data } })
  return response
}