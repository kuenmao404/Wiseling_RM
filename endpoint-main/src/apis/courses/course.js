import api from '../../lib/api'
import { useQuery, useMutation } from "@tanstack/react-query"

// 取得課程 status : 0|1|2 (公開|好友公開|私人)，joinStatus : 0|1|2 (直接加入|申請加入|不開放)
export const getCourses = async (data = {}) => {
  const response = await api({ method: "GET", cmd: "api/Public/F022A600-856A-4169-8002-1613105D4A70", data: { ...data } })
  return response
}

// 取得課程詳細資料，包括subclass
export const getCourse = async (data = {}) => {
  const response = await api({ method: "GET", cmd: `api/Course/${data?.cid}`, data: { ...data } })
  return response
}

// 新增課程，courseStatus 0|1 (公開|私人) ；joinStatus 0|1|2 (直接加入|申請加入|不開放)；回傳status、message
export const addCourses = async (data = {}) => {
  const response = await api({ method: "POST", cmd: "api/Course", fileObj: { ...data } })
  return response
}

// 編輯課程，courseStatus 0|1 (公開|私人) ；joinStatus 0|1|2 (直接加入|申請加入|不開放)；回傳status、message
export const editCourses = async (data = {}) => {
  const response = await api({ method: "PUT", cmd: `api/Course/${data?.cid}`, fileObj: { ...data } })
  return response
}

// 刪除課程，回傳status、message
export const delCourses = async (data = {}) => {
  const response = await api({ method: "DELETE", cmd: `api/Course/${data?.cid}`, data: { ...data } })
  return response
}

// 取得Tag (搜尋用)
export const getTags = async (data = {}) => {
  const response = await api({ method: "GET", cmd: "api/Public/E76C0175-C960-49B5-857B-00DF1816316F", data: { order: "useCount_d", likeMode: 1, like_column: "text", ...data } })
  return response
}

// 取得課程章節
export const getCourseChapter = async (data = {}) => {
  const response = await api({ method: "GET", cmd: `api/Course/ChapterAndVideo/${data?.cid}`, data: { order: "rank_a", ...data } })
  return response
}

// 取得課程單一章節 (Public)
export const getCourseChapterPub = async (data = {}) => {
  const response = await api({ method: "GET", cmd: `api/Public/931E3936-3C67-4B5B-9766-5DBD12AFB650`, data: { order: "rank_a", ...data } })
  return response
}

// 取得課程章節影片 判斷V (章節) 與R (影片) 權限
export const getCourseChapterVideo = async (data = {}) => {
  const response = await api({ method: "GET", cmd: `api/Course/ChapterAndVideo/${data?.cid}`, data: { ...data } })
  return response
}

// 新增影片至課程章節 透過YouTube API或網站內影片新增至課程章節 { cid: 章節cid, courseCID: 課程cid, bYoutube: true|false, vid: 若bYoutube為true可不傳, url: 若bYoutube為true需傳 }
export const addChapterVideo = async (data = {}) => {
  const response = await api({ method: "POST", cmd: `api/Course/ChapterVideoYoutubeAPI/${data?.cid}`, data: { ...data } })
  return response
}

// 取得加入課程申請列表，cid為課程cid，applyStatus：0|1|2 (申請中|同意|拒絕)
export const getApplyCourseList = async (data = {}) => {
  const response = await api({ method: "GET", cmd: `api/Tx/0306BDFB-6620-4CB4-AE8F-36817B5DEC74`, data: { ...data } })
  return response
}

// 會員申請加入課程
export const applyCourse = async (data = {}) => {
  const response = await api({ method: "POST", cmd: `api/Tx/0306BDFB-6620-4CB4-AE8F-36817B5DEC74`, data: { ...data } })
  return response
}

// 接受或拒絕課程申請
export const handleApplyCourse = async (data = {}) => {
  const response = await api({ method: "PUT", cmd: `api/Tx/0306BDFB-6620-4CB4-AE8F-36817B5DEC74`, data: { ...data } })
  return response
}

// 會員取消課程申請
export const cancelApplyCourse = async (data = {}) => {
  const response = await api({ method: "DELETE", cmd: `api/Tx/0306BDFB-6620-4CB4-AE8F-36817B5DEC74`, data: { ...data } })
  return response
}

// 取得課程成員
export const getCourseMember = async (data = {}) => {
  const response = await api({ method: "GET", cmd: `api/Tx/5643DCC5-9FED-4C48-94A9-686700DCC115`, data: { order: "cid_a,lastLoginDT_d", bTotal: true, ...data } })
  return response
}

// 管理課程成員群組
export const editCourseMember = async (data = {}) => {
  const response = await api({ method: "PUT", cmd: `api/Tx/5643DCC5-9FED-4C48-94A9-686700DCC115`, data: { ...data } })
  return response
}

// 踢出課程成員
export const deleteCourseMember = async (data = {}) => {
  const response = await api({ method: "DELETE", cmd: `api/Tx/5643DCC5-9FED-4C48-94A9-686700DCC115`, data: { ...data } })
  return response
}

// 取得課程成員並包含可否踢出、更改成員權限
export const getCourseMemberPermission = async (data = {}) => {
  const response = await api({ method: "GET", cmd: `api/Course/Member/${data?.cid}`, data: { ...data } })
  return response
}

// 新增課程章節
export const addCourseChapter = async (data = {}) => {
  const response = await api({ method: "POST", cmd: `api/Tx/D16CA816-F509-4ABA-A653-BE3FFD351EC5`, data: { ...data } })
  return response
}

// 匯入課程章節從影片收藏 xp_importToCourseChapter
export const importCourseChapter = async ({ ...data }) => {
  const response = await api({ method: "POST", cmd: `api/Tx/8D6C6733-186A-4D30-84E9-7470073F2C38`, data: { ...data } })
  return response
}
export const importCourseChapterApi = (query = {}) => {
  return useMutation({ mutationFn: importCourseChapter, ...query })
}


// 編輯課程章節
export const editCourseChapter = async (data = {}) => {
  const response = await api({ method: "PUT", cmd: `api/Tx/D16CA816-F509-4ABA-A653-BE3FFD351EC5`, data: { ...data } })
  return response
}

// 刪除課程章節
export const delCourseChapter = async (data = {}) => {
  const response = await api({ method: "DELETE", cmd: `api/Tx/D16CA816-F509-4ABA-A653-BE3FFD351EC5`, data: { ...data } })
  return response
}

// 刪除課程章節影片 xp_deleteCourseChapterVideo 需要D權限 cid：章節cid
export const delCourseChapterVideo = async (data = {}) => {
  const response = await api({ method: "DELETE", cmd: `api/Tx/93390F90-935E-4440-A1A1-45FD168B3B57`, data: { ...data } })
  return response
}

// 排序課程章節 sortstr：章節排序cid字串，逗號隔開例如：10,23,64,66
export const sortCourseChapter = async (data = {}) => {
  const response = await api({ method: "PUT", cmd: `api/Tx/708359A4-604B-4F89-B9BA-7ED665E8436A`, data: { ...data } })
  return response
}

// 排序課程章節內影片 sortstr：影片排序id字串，逗號隔開例如：10,23,64,66
export const sortCourseChapterVideo = async (data = {}) => {
  const response = await api({ method: "PUT", cmd: `api/Tx/A3AD447A-B50B-490F-A2DE-BC85017A3212`, data: { ...data } })
  return response
}

// 取得我的課程 (包含Owner與加入)
export const getMidCourse = async (data = {}) => {
  const response = await api({ method: "GET", cmd: `api/Tx/A4D31EEB-B576-47E7-A72F-AA69E2C48133`, data: { ...data } })
  return response
}

// 會員退出課程
export const quitMidCourse = async (data = {}) => {
  const response = await api({ method: "DELETE", cmd: `api/Tx/A4D31EEB-B576-47E7-A72F-AA69E2C48133`, data: { ...data } })
  return response
}

// 取得課程群組 vd_CourseClassGroup_Front { courseCID }
export const getCourseGroups = async (data = {}) => {
  const response = await api({ method: "GET", cmd: `api/Tx/692B7302-C5EB-49A7-BF3D-D1B030CF549D`, data: { ...data } })
  return response
}

// 取得課程邀請信狀態
export const getMailInvite = async (data = {}) => {
  const response = await api({ method: "GET", cmd: `api/Mail`, data: { ...data } })
  return response
}

// 發送課程邀請信
export const sendMailInvite = async (data = {}) => {
  const response = await api({ method: "POST", cmd: `api/Mail`, data: { ...data } })
  return response
}

// 發送課程邀請信
export const resendMailInvite = async (data = {}) => {
  const response = await api({ method: "PUT", cmd: `api/Mail`, data: { ...data } })
  return response
}

// 發送課程邀請信
export const delMailInvite = async (data = {}) => {
  const response = await api({ method: "DELETE", cmd: `api/Mail`, data: { ...data } })
  return response
}

// 查看Token
export const getMailTokenInfo = async (data = {}) => {
  const response = await api({ method: "GET", cmd: `api/Mail/token`, data: { ...data } })
  return response
}

// 課程邀請信
export const activeMailToken = async (data = {}) => {
  const response = await api({ method: "POST", cmd: `api/Tx/62A70BF6-8D4B-43B5-837A-B99C9573BCB6`, data: { ...data } })
  return response
}

// 取得會員馬賽克磚
export const getMemberCalender = async (data = {}) => {
  const response = await api({ method: "GET", cmd: `api/Member/CalenderHeatMap`, data: { ...data } })
  return response
}

// 取得課程馬賽克磚
export const getCourseCalender = async ({ CourseCID, ...data } = {}) => {
  const response = await api({ method: "GET", cmd: `api/Course/CalenderHeatMap/${CourseCID}`, data: { ...data } })
  return response
}

// 取得課程馬賽克磚會員 vd_Course_CalendarMember { cid, mapID }
export const getCourseCalenderMember = async (data = {}) => {
  const response = await api({ method: "GET", cmd: `api/Tx/288AEE1F-DAF4-4F6C-855A-20915CC3D00E`, data: { ...data } })
  return response
}

// 取得課程馬賽克磚會員當天的詳細資料 { cid, mapID, ownerMID }
export const getCourseCalenderMemberDes = async (data = {}) => {
  const response = await api({ method: "GET", cmd: `api/Tx/C437DAAE-9A20-4E35-B59C-680F4EDE10A3`, data: { order: "since_d", ...data } })
  return response
}