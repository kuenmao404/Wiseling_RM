import Config from 'Config'
import api from './api';

const pasteImg = async (dataTransfer, ref) => {
  let files = []
  for (let index = 0; index < dataTransfer.items.length; index += 1) {
    const file = dataTransfer.files.item(index);

    if (file) {
      files.push(file);
    }
  }

  await Promise.all(
    files.map(async (file) => {
      const url = await handleUploadMDPic(file);
      const insertedMarkdown = insertToTextArea(`![](${url})`, ref);
      if (!insertedMarkdown) {
        return null;
      }
      return insertedMarkdown;
    }),
  );
}

const handleUploadMDPic = async (file, cid = null) => {
  const data = (!!cid ? { cid } : {});
  let response = await api({
    method: "POST",
    cmd: `api/File`,
    fileObj: { ...data, files: [file], bMD: true }
  })
  if (response.ok) {
    return `${Config.apiurl}/${cid == null ? "Assets" : "api/File"}?uuid=${response.body.uuid}`
  } else {
    return "上傳圖片失敗"
  }
}

const insertToTextArea = (intsertString, ref) => {
  const textarea = ref;
  if (!textarea) {
    return null;
  }

  let sentence = textarea.value || "";
  const len = sentence.length;
  const pos = textarea.selectionStart;
  const end = textarea.selectionEnd;

  const front = sentence.slice(0, pos);
  const back = sentence.slice(pos, len);

  sentence = front + intsertString + back;

  textarea.value = sentence;
  textarea.selectionEnd = end + intsertString.length;

  return sentence;
};

export default pasteImg
export { handleUploadMDPic }