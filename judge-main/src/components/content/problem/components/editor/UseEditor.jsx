import { langs } from "@uiw/codemirror-extensions-langs";
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";
import { atom, useAtom, useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";

/** Local storage editor atom */
export const editorStorageAtom = atomWithStorage("editor", {
  default: {
    code: "",
    langKey: { name: "C", key: "c" },
    mode: "Normal",
    file: {},
  }
});

export const codeMirrorAtom = atom({
  theme: tokyoNight,
  language: langs.c(),
  basicSetup: {
    crosshairCursor: false,
  },
  autoFocus: false,
});

/**
 * 透過 Jotai derived atom 組合 CodeMirror 的 extensions
 * 如果 atom 更新，derived atom 也會更新
 */
export const codeMirrorExtensions = atom((get) => {
  const { editorMode, language } = get(codeMirrorAtom);
  let exts = [language];

  if (editorMode) {
    exts = [editorMode, ...exts];
  }

  return exts;
});

/** 更新 langKey, language */
export const setLanguageAtom = atom(null, (_get, set, { pid, lang }) => {
  set(editorStorageAtom, (state) => ({ ...state, [pid]: { ...state?.[pid], langKey: lang } }));
  set(codeMirrorAtom, (state) => ({
    ...state,
    language: langs[lang?.key || "c"](),
  }));
});

/** 更新 Editor Mode */
export const setEditorModeAtom = atom(null, async (_get, set, { pid, mode }) => {
  set(editorStorageAtom, (state) => ({ ...state, [pid]: { ...state?.[pid], mode } }));

  if (mode?.toLowerCase() === "vim") {
    const { vim } = await import("@replit/codemirror-vim");
    set(codeMirrorAtom, (state) => ({
      ...state,
      editorMode: vim(),
    }));
  } else {
    set(codeMirrorAtom, (state) => ({
      ...state,
      editorMode: undefined,
    }));
  }
});

/** 更新 Editor file */
export const setEditorFileAtom = atom(null, async (_get, set, { file = null, pid }) => {
  set(editorStorageAtom, (state) => ({ ...state, [pid]: { ...state?.[pid], file: file || null } }));
})


/** Readonly editor atoms */
const editorAtom = atom((get) => ({
  ...get(editorStorageAtom),
  ...get(codeMirrorAtom),
  extensions: get(codeMirrorExtensions),
}));

export function useEditor(pid) {
  const state = useAtomValue(editorAtom)
  return { ...state, ...(state?.default), ...(state?.[pid]) };
}
