const json = {
  "影片": 18,
  "筆記": 5,
  "影片按讚": 16,
  "筆記按讚": 17,
  "影片收藏清單": 34,
  "隨選播放清單": 15,
}

let array = []
Object.keys(json)?.map((k, idx) => array[idx] = { name: k, type: json[k] })

export default json

export { array }