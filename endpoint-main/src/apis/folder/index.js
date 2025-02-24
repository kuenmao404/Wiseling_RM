import api from "../../lib/api"
import { useQuery, useMutation } from "@tanstack/react-query"

const getVlistTx = async ({ ...data }) => {
  const response = await api({ method: "GET", cmd: "api/Tx/81D357F8-D5AB-483A-A20A-45CA14969504", data: { ...data } })
  return response
}

const getVlist = async ({ cid, ...data }) => {
  return await api({ method: "GET", cmd: `api/Member/Folder/${cid}`, data: { ...data } })
}
export const getVlistApi = ({ cid, ownerMID }, query = {}) => {
  return useQuery({ queryKey: ['getVlist', cid, ownerMID], queryFn: () => getVlist({ cid, ownerMID }), enabled: !!ownerMID, ...query })
}

const editVlist = async ({ ...data }) => {
  return await api({ method: "PUT", cmd: "api/Tx/81D357F8-D5AB-483A-A20A-45CA14969504", data: { ...data } })
}
export const editVlistApi = (query = {}) => {
  return useMutation({ mutationFn: editVlist, ...query })
}

const addVlist = async ({ ...data }) => {
  return await api({ method: "POST", cmd: "api/Tx/81D357F8-D5AB-483A-A20A-45CA14969504", data: { ...data } })
}
export const addVlistApi = (query = {}) => {
  return useMutation({ mutationFn: addVlist, ...query })
}

const delVlist = async ({ ...data }) => {
  return await api({ method: "DELETE", cmd: "api/Tx/81D357F8-D5AB-483A-A20A-45CA14969504", data: { ...data } })
}
export const delVlistApi = (query = {}) => {
  return useMutation({ mutationFn: delVlist, ...query })
}

// POST - 移動資料夾 管理影片收藏清單 (資料夾)
const moveVlist = async ({ ...data }) => {
  return await api({ method: "POST", cmd: "api/Tx/2A6C29DB-4B44-43A5-B056-71B8A04B27F5", data: { ...data } })
}
export const moveVlistApi = (query = {}) => {
  return useMutation({ mutationFn: moveVlist, ...query })
}

const sortVlist = async ({ ...data }) => {
  return await api({ method: "PUT", cmd: "api/Tx/2A6C29DB-4B44-43A5-B056-71B8A04B27F5", data: { ...data } })
}
export const sortVlistApi = (query = {}) => {
  return useMutation({ mutationFn: sortVlist, ...query })
}

const addVlistNotebook = async ({ cid, ...data }) => {
  return await api({ method: "POST", cmd: `api/Video/VList/${cid}`, data: { ...data } })
}
export const addVlistNotebookApi = (query = {}) => {
  return useMutation({ mutationFn: addVlistNotebook, ...query })
}

// 排序影片收藏清單資料夾內筆記本 (包含影片) xp_sortVListVideo_new
const sortVlistNotebook = async ({ ...data }) => {
  return await api({ method: "PUT", cmd: `api/Tx/F68EFB2F-DF77-4209-B9A9-A29A9B79E5DF`, data: { ...data } })
}
export const sortVlistNotebookApi = (query = {}) => {
  return useMutation({ mutationFn: sortVlistNotebook, ...query })
}

// 刪除影片收藏清單資料夾內筆記本 (包含影片) xp_deleteVListVideo_New
const delVlistNotebook = async ({ ...data }) => {
  return await api({ method: "DELETE", cmd: `api/Tx/F68EFB2F-DF77-4209-B9A9-A29A9B79E5DF`, data: { ...data } })
}
export const delVlistNotebookApi = (query = {}) => {
  return useMutation({ mutationFn: delVlistNotebook, ...query })
}

// 切換筆記本或影片 管理影片收藏清單資料夾內筆記本或影片 { cid, vid, rank, updateNotebookCID }
const updateVlistNotebook = async ({ ...data }) => {
  return await api({ method: "POST", cmd: `api/Tx/F68EFB2F-DF77-4209-B9A9-A29A9B79E5DF`, data: { ...data } })
}
export const updateVlistNotebookApi = (query = {}) => {
  return useMutation({ mutationFn: updateVlistNotebook, ...query })
}