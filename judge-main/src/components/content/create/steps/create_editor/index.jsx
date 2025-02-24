import React, { useCallback, useEffect } from "react";
import { cn } from "../../../../../lib/utils";
import { EditorFooter } from "./Footer";
import { editorStorageAtom, setEditorModeAtom, setLanguageAtom, setEditorFileAtom, useEditor } from "./UseEditor";
import ReactCodeMirror from "@uiw/react-codemirror";
import { useSetAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { Tooltip } from "@mui/material";
// import { EditorHeader } from "./header";

export function Editor({ pid, className, lang, onSubmitClick, onChange: handleChange, ...props }) {
  const [editor] = useEditor();
  const setEditorStorage = useSetAtom(editorStorageAtom);
  const setLanguage = useSetAtom(setLanguageAtom);
  const setEditorMode = useSetAtom(setEditorModeAtom);
  const setEditorFile = useSetAtom(setEditorFileAtom);

  /**
   * This callback will do the following:
   * 1. Set the editor mode to the stored mode
   * 2. Set the language to the stored language
   * 3. If the stored pid is different from the current pid, update the stored pid and clear the code
   */
  const refreshEditorStorage = useAtomCallback(
    useCallback(
      (get) => {
        const { pid: storedPid, langKey: storedLangKey, mode: storedMode, file: storedFile, code: storedCode } = get(editorStorageAtom);

        handleChange({ code: storedCode, lang: storedLangKey || lang[0] })

        if (storedMode) {
          setEditorMode(storedMode);
        }
        if (storedLangKey) {
          setLanguage(storedLangKey);
        }
        if (storedFile) {
          setEditorFile(storedFile)
        }
        if (pid !== storedPid) {
          setEditorStorage((state) => ({ ...state, pid, code: "" }));
          setLanguage(lang[0]);
        }
        return pid;
      },
      [setEditorStorage, setLanguage, setEditorMode, setEditorFile, pid]
    )
  );

  /**
   * Refresh EditorStorage when mounted
   * Note: 如果沒有使用 callback 會導致讀到的 pid, langKey 是 undefined
   */
  useEffect(() => {
    refreshEditorStorage();
  }, [refreshEditorStorage]);

  const onChange = useCallback(
    (code, _viewUpdate) => {
      setEditorStorage((state) => ({ ...state, code }));
      handleChange({ code })
    },
    [setEditorStorage]
  );

  return (
    <div className={cn("h-full w-full flex flex-col", className)} {...props}>
      {/* <EditorHeader className="h-8 m-1 mb-2" /> */}
      <Tooltip title={!editor?.file?.name ? null : "有上傳程式碼不能編輯，如需使用編輯器請取消上傳"} placement="top" arrow>
        <div className="h-full overflow-auto">
          <ReactCodeMirror
            className="h-full overflow-auto"
            height="100%"
            value={editor.code}
            theme={editor.theme}
            extensions={editor.extensions}
            basicSetup={editor.basicSetup}
            autoFocus={editor.autoFocus}
            onChange={onChange}
            editable={!editor?.file?.name}
          />
        </div>
      </Tooltip>
      <EditorFooter
        className="py-1 px-1"
        lang={lang}
        onSubmitClick={() => onSubmitClick({ pid: editor?.pid, plid: editor?.langKey?.plid, code: editor?.code, file: !editor?.file?.name ? null : editor?.file })}
        onRunClick={() => console.log('run')}
      />
    </div>
  );
}
