import { Checkbox } from "@/components/elements/ui/Checkbox";
import { Label } from "@/components/elements/ui/Label";

/**
 * @typedef {Object} LanguageSelectorProps
 * @property {string} [className] - The class name of the component
 * @property {{ plid: number, name: string, key: string }} langs
 * @property {(checked: boolean, plids number | "ALL") => void} onCheckedChange
 * @property {number[]} selected
 */

import { cn } from "@/lib/utils";

/**
 * A component for selecting the language for the code editor
 * @param {LanguageSelectorProps} props
 */
export default function LanguageSelector({ langs, className, onCheckedChange, selected }) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Label className="font-bold flex gap-1 items-center">
        <Checkbox
          checked={selected.length === langs.length}
          onCheckedChange={(checked) => onCheckedChange(checked, "ALL")}
        />
        全選
      </Label>
      {langs.map(({ plid, name, key }) => (
        <Label key={plid} className="font-bold flex gap-1 items-center">
          <Checkbox
            key={plid}
            checked={selected.includes(plid)}
            onCheckedChange={(checked) => onCheckedChange(checked, plid)}
          />
          {name}
        </Label>
      ))}
    </div>
  )
}
