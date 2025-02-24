import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/elements/ui/Select";
import { editorStorageAtom, setLanguageAtom } from "./useEditor";
import { useAtom, useSetAtom } from "jotai";

export function LangSelector({ languages, ...props }) {
  const updateLanguage = useSetAtom(setLanguageAtom);
  const [{ langKey: languageKey }] = useAtom(editorStorageAtom);

  return (
    <Select
      value={(languages || [])?.find(d => d?.name == languageKey?.name)?.name || "c"}
      defaultValue={languages?.[0]?.name || "c"}
      onValueChange={(lang) => updateLanguage((languages || [])?.find(d => d?.name == lang))}
      {...props}
    >
      <SelectTrigger className="w-[180px] text-gray-300">
        <SelectValue placeholder="Select your programming language" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Languages</SelectLabel>
          {languages.map((lang) => (
            <SelectItem key={lang.name + lang.key} value={lang.name}>
              {lang.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
