import React from 'react'
import MdEditor from '@uiw/react-markdown-editor'
import MarkdownPreview from './MarkdownPreview';
import { EditorView } from "@codemirror/view";
// import { MathJax, MathJaxContext } from "better-react-mathjax";
// import remarkMath from "remark-math";

export default function MarkdownEditor({
  value = "",
  onChange = () => { },
  height = "500px",
  autoFocus = false,
  enablePreview = true,
}) {
  return (
    <MdEditor
      value={value}
      onChange={(value, viewUpdate) => {
        onChange(value)
      }}
      height={height}
      visible={true}
      autoFocus={autoFocus}
      extensions={[EditorView.lineWrapping]}
      enablePreview={enablePreview}
      renderPreview={(props) =>
        <MarkdownPreview {...props} source={value} />
      }
    />
  )
}
