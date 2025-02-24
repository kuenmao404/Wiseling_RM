import React from "react";
import { Button as UIButton } from "../../../../elements/ui/Button";
import { cn } from "../../../../../lib/utils";
import { LangSelector } from "./LangSelector";
import { setEditorFileAtom, setEditorModeAtom, useEditor } from "./UseEditor";
import { langs } from "@uiw/codemirror-extensions-langs";
import { useSetAtom } from "jotai";
import { styled } from '@mui/material/styles'
import { Button, Tooltip } from "@mui/material";
import { CloudUpload } from "@mui/icons-material";

export function EditorFooter({ onRunClick, onSubmitClick, className, lang, ...props }) {
  const setEditorMode = useSetAtom(setEditorModeAtom);
  const setEditorFile = useSetAtom(setEditorFileAtom)
  const [{ mode, file }] = useEditor();

  return (
    <div className={cn("flex gap-1 items-center justify-between bg-[#1a1b26] flex-wrap", className)} {...props}>
      <div className="flex gap-1 items-center justify-start flex-wrap">
        <LangSelector
          languages={lang || []}
        // languages={Object.keys(langs)
        //   .sort()
        //   .map((lang) => ({ name: lang, key: lang }))}
        />
        <UIButton
          variant="default"
          className="bg-slate-800"
          onClick={() => {
            setEditorMode(mode == "Normal" ? "Vim" : "Normal");
          }}
        >
          {mode}
        </UIButton>
        {(file == null || !file?.name) ?
          <Button component="label" variant="outlined" color={`warning`} startIcon={<CloudUpload />}>
            上傳程式碼
            <VisuallyHiddenInput type="file" onChange={(e) => setEditorFile(e.target?.files?.[0])} />
          </Button> :
          <Tooltip title={"點我移除檔案"}>
            <div className="text-white text-xs cursor-pointer" onClick={() => setEditorFile({})}>
              {file?.name}
            </div>
          </Tooltip>
        }

      </div>
      <div className="flex gap-1 items-center justify-end">
        {/* <Button variant="contained" color={"inherit"} sx={{ textTransform: "none" }} onClick={onRunClick}>
          Run
        </Button> */}
        <Button variant="contained" color="success" sx={{ textTransform: "none" }} onClick={onSubmitClick}>
          Submit
        </Button>
      </div>
    </div>
  );
}

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});