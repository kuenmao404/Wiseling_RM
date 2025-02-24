import api from '../../lib/api'
import { useQuery } from '@tanstack/react-query'

// get 取得題目 vd_ProblemTag_Pub
export const getCodeTopic = async (data = {}) => {
  const response = await api({
    method: "GET",
    cmd: "api/Public/CA5610E5-6E54-425F-A657-B7B5FDDE1F8A",
    data: { like_column: "searchstr", bTotal: true, order: "difficulty_a", ...data }
  })
  return response
}

export const getCodeTopicForAdd = async (data = {}) => {
  const response = await api({
    method: "GET",
    cmd: "api/Tx/794BBD5F-40A9-4116-8EAC-28C7FFA9E0D9",
    data: { bTotal: true, ...data }
  })
  return response
}

// vd_CourseProblemMStatus 課程成員解題狀況 { cid, coursecid, pid, bAccept }
export const getCourseProblemMStatus = async (data = {}) => {
  return await api({
    method: "GET",
    cmd: "api/Tx/EA1E4B46-E7E2-4340-B0CE-7A623B26681C",
    data: { bTotal: true, ...data }
  })
}
export const getCourseProblemMStatusApi = ({ cid, courseCID, pid }, query = {}) => {
  return useQuery({ queryKey: ['getCourseProblemMStatus', cid, courseCID, pid], queryFn: () => getCourseProblemMStatus({ cid, courseCID, pid }), ...query })
}

// vd_CourseProblemMSolution 課程成員解題程式碼 { cid, coursecid, pid, ownerMID, solutionID }
export const getCourseProblemMSolution = async (data = {}) => {
  return await api({
    method: "GET",
    cmd: "api/Tx/0B01507B-7C46-4828-AB50-81122151A60A",
    data: { bTotal: true, order: "since_d", ...data }
  })
}
export const getCourseProblemMSolutionApi = ({ cid, coursecid, pid, ownerMID, solutionID }, query = {}) => {
  return useQuery({ queryKey: ['getCourseProblemMSolution', cid, pid, ownerMID], queryFn: () => getCourseProblemMSolution({ cid, coursecid, pid, ownerMID, solutionID }), ...query })
}
