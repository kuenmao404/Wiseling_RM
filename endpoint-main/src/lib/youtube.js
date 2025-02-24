export const parseVideoID = (string = "") => {
  // 移除前面的 protocol 和 www
  let cleanURL = string
    .replace("http://", "")
    .replace("https://", "")
    .replace("www.", "")
    .replace("youtu.be/", "youtube.com/watch?v=");

  // 提取 '?' 後面的參數部分
  let queryString = cleanURL.split('?')[1] || '';

  // 查找 'v' 參數的值
  const params = new URLSearchParams(queryString);
  let videoID = params.get('v');

  // 如果 URL 沒有 v 參數，可能是短鏈結，提取短鏈結中的 ID
  if (!videoID && cleanURL.includes("youtube.com/watch")) {
    videoID = cleanURL.split("v=")[1]?.substring(0, 11);
  }

  return videoID || "";
};

export function ytVidId(url) {
  var p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
  // return (url.match(p)) ? RegExp.$1 : false;
  return (url.match(p)) ? true : false;
}

export function ytPlaylistId(url) {
  var p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|playlist\?list=))([\w-]+)(?:&.*list=([\w-]+))?/;
  return (url.match(p) && url.includes("list=")) ? true : false;
}