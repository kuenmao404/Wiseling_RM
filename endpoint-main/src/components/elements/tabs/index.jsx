import React, { useEffect, useMemo } from 'react'
import { Box, Tabs, Tab, Divider } from '@mui/material'
import { atom, useAtom } from 'jotai'
import { atomWithStorage, createJSONStorage } from "jotai/utils";

const storage = createJSONStorage(() => sessionStorage)
const tabAtom = atomWithStorage("tabAtom", { normal: 0 }, storage)

function TabGroup({
  tabs,
  defaultValue,
  children,
  sx,
  id,
  ...props
}) {
  const [tab, setTab] = useAtom(tabAtom)
  const idx = tab?.[(id || 'normal')]

  useEffect(() => {
    let value = Number.isInteger(defaultValue) ? defaultValue : 0
    setTab({ ...tab, [(id || 'normal')]: value })
  }, [])

  const memoizedChildren = useMemo(() => {
    const idx = tab?.[(id || 'normal')]
    return children[idx];
  }, [idx, children]);

  if (!tabs.length || !children.length) {
    return null; // 簡單的錯誤處理，如果 tabs 或 children 為空，則不渲染任何內容
  }

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', ...sx }}  {...props}>
        <Tabs
          value={idx || 0}
          onChange={(e, value) => setTab({ ...tab, [(id || 'normal')]: value })}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ minHeight: "32px" }}
        >
          {
            tabs?.map(d => <Tab key={d} label={<b>{d}</b>} />)
          }
        </Tabs>
      </Box>
      {memoizedChildren}
    </>

  )
}

export { TabGroup }