import React, { Fragment, useState } from 'react'
import { ScrollArea } from "../../..//elements/ui/ScrollArea"
import { Button } from "../../../elements/ui/Button"
import { CopyIcon, CheckIcon } from "@radix-ui/react-icons"
// import { Check, Copy } from "lucide-react"

/**
 * @typedef {Object} TestcaseViewerProps
 * @property {string} content - The content to be displayed in the viewer
 * @property {string} [maxHeight='400px'] - The maximum height of the scrollable area
 */

/**
 * A component for viewing and copying long content, such as online judge testcases
 * @param {TestcaseViewerProps} props
 * @returns {JSX.Element}
 */
export default function TestcaseViewer({ content, maxHeight = "400px" }) {
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
    <div className="border bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center p-2 bg-muted">
        <h3 className="text-sm font-medium">Testcase Content</h3>
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
