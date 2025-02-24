import React, { useState } from 'react'
import { ScrollArea } from "@/components/elements/ui/ScrollArea"
import { Button } from "@/components/elements/ui/Button"
import { CopyIcon, CheckIcon } from "@radix-ui/react-icons"
import { cn } from '@/lib/utils'

/**
 * @typedef {Object} TestcaseContentProps
 * @property {string} content - The content to be displayed in the viewer
 * @property {string} [maxHeight='400px'] - The maximum height of the scrollable area
 * @property {string} [className] - The class name of the component
 */

/**
 * A component for viewing and copying long content, such as online judge testcases
 * @param {TestcaseViewerProps} props
 * @returns {JSX.Element}
 */
export default function TestcaseContent({ content, className, maxHeight = "400px" }) {
  const [isCopied, setIsCopied] = useState(false)

  /**
   * Copies the content to the clipboard
   * @returns {Promise<void>}
   */
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <div className={cn(className, "border bg-white rounded-lg shadow-sm")}>
      <div className="flex justify-between items-center p-2 bg-muted">
        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
          className="flex items-center gap-1"
        >
          {isCopied ? (
            <>
              <CheckIcon className="h-4 w-4" />
              Copied
            </>
          ) : (
            <>
              <CopyIcon className="h-4 w-4" />
              Copy
            </>
          )}
        </Button>
      </div>
      <ScrollArea className="p-4 h-72" style={{ maxHeight }}>
        <pre className="text-sm whitespace-pre-wrap break-words">{content}</pre>
      </ScrollArea>
    </div>
  )
}
