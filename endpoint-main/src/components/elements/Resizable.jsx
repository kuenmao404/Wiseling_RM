import React from "react"
// import { DragHandleDots2Icon } from "@radix-ui/react-icons"
import DragHandleIcon from '@mui/icons-material/DragHandle';
import * as ResizablePrimitive from "react-resizable-panels"
import { Box } from "@mui/material";

const ResizablePanelGroup = ({
  className,
  ...props
}) => (
  <ResizablePrimitive.PanelGroup
    className={
      `flex h-full w-full data-[panel-group-direction=vertical]:flex-col ${className}`
    }
    {...props}
  />
)

const ResizablePanel = ResizablePrimitive.Panel

const ResizableHandle = ({
  withHandle = null,
  className,
  ...props
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className={
      `resizable_handle bg-border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90 ${className}`
    }
    {...props}
  >
    {withHandle && (
      <Box
        // className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border"
        sx={{
          zIndex: "10", display: "flex", width: "2rem", height: "0.75rem",
          transform: "rotate(90deg)", backgroundColor: "hsl(214.3, 31.8%, 91.4%)", borderRadius: "calc(0.5rem - 4px)",
          border: ".5px solid rgba(0, 0, 0, .1)"

        }}
        className="jcc aic"
      >
        <DragHandleIcon className="h-2.5 w-2.5" fontSize="small" />
      </Box>
    )}
  </ResizablePrimitive.PanelResizeHandle>
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
