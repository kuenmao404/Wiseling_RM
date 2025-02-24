import React, { useRef, useState, useCallback, useEffect } from 'react'
import MDEditor, { commands } from '@uiw/react-md-editor'
import { Box, Portal } from '@mui/material'
import Config from 'Config'
import api from '../../../lib/api'
import { rehypePlugins } from './MarkdownView'

export default function MarkdownEditor(props) {
  const { sx, cid = null, className, handleChange, value, onKeyDown, autoFocus = true, placeholder = "Esc鍵離開編輯器" } = props
  const mdEl = useRef(null)
  const textApiRef = useRef(null)
  const inputRef = useRef(null)
  const [insertImg, setInsertImg] = useState("")

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setIsFullscreen(mdEl.current?.fullscreen)
  }, [mdEl.current?.fullscreen]);

  const handleUploadMDPic = async (file) => {
    let response = await api({
      method: "POST",
      cmd: `api/File`,
      fileObj: { ...(cid == null ? {} : { cid }), files: [file], bMD: true }
    })
    if (response.ok) {
      return `${Config.apiurl}/${cid == null ? "Assets" : "api/File"}?uuid=${response.body.uuid}`
    } else {
      return "上傳圖片失敗"
    }
  }

  const onImagePasted = async (dataTransfer, setMarkdown) => {
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
        const insertedMarkdown = insertToTextArea(`![](${url})`);
        if (!insertedMarkdown) {
          return;
        }
        setMarkdown(insertedMarkdown);
      }),
    );
  };

  const insertToTextArea = (intsertString) => {
    const textarea = mdEl.current.textarea;
    if (!textarea) {
      return null;
    }

    let sentence = textarea.value;
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

  const image = (inputRef, textApiRef) => ({
    name: 'image',
    keyCommand: 'image',
    render: (command, disabled, executeCommand) => {
      return (
        <button
          type="button"
          aria-label="Insert Image"
          disabled={disabled}
          onClick={() => {
            executeCommand(command, command.groupName);
          }}
          title="選擇圖片"
        >
          <svg width="12" height="12" viewBox="0 0 20 20">
            <path
              fill="currentColor"
              d="M15 9c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4-7H1c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm-1 13l-6-5-2 2-4-5-4 8V4h16v11z"
            ></path>
          </svg>
        </button>
      );
    },
    execute: (state, api) => {
      inputRef.current.click();
      textApiRef.current = api;
    }
  });

  const inputImageHandler = useCallback(async (event) => {
    if (event.target.files && event.target.files.length === 1) {
      setInsertImg("");
      const url = await handleUploadMDPic(event.target.files[0]);
      const insertedMarkdown = `![圖片說明](${url})`
      if (!insertedMarkdown) return;

      textApiRef.current.replaceSelection(insertedMarkdown);
    }
  }, []);

  const editChoice = (inputRef, textApiRef) => [
    image(inputRef, textApiRef)
  ];

  const EditorChild = (
    <MDEditor
      ref={mdEl}
      value={value}
      height={"100%"}
      visibleDragbar={false}
      textareaProps={{ placeholder: placeholder, onKeyDown }}
      onChange={(text, event) => handleChange(text, event)}
      onPaste={async (event) => {
        await onImagePasted(event.clipboardData, handleChange);
      }}
      fullscreen={isFullscreen}
      previewOptions={{
        className: 'category_md_container',
        // linkTarget: "_blank",
        rehypePlugins: rehypePlugins,
        rehypeRewrite: (node, index, parent) => {
          if (node.tagName == "img") {
            node.properties.src = (node.properties.src?.[0] == '/' ? Config.apiurl : "") + node.properties.src
          }
        }
      }}
      commands={[...commands.getCommands().filter(f => f.name != 'image'), ...editChoice(inputRef, textApiRef)]}
      autoFocus={autoFocus}
    />
  )

  return (
    <Box sx={sx || {}} className={className}>
      <input
        ref={inputRef}
        style={{ visibility: "hidden", display: "none" }}
        type="file"
        accept=".jpg,.png,.jpeg,.jfif,.gif"
        name="avatar"
        value={insertImg}
        onChange={inputImageHandler}
      />
      {isFullscreen ?
        <Portal>
          {EditorChild}
        </Portal> :
        EditorChild
      }
    </Box>

  )
}
