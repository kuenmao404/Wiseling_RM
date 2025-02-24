import React, { Fragment } from 'react'
import { Box, Divider, } from '@mui/material'

import { TabGroup } from '@/components/elements/tab'
import OtherPageLink from './OtherPageLink'
import ProblemList from './ProblemList'

const counts = 20;

function Index() {

  return (
    <Box sx={{ p: 2, width: "100%" }}>
      {/* <div>
        解題平台Beta版 如要找題目請至<a href='https://wiseling.wke.csie.ncnu.edu.tw' style={{ color: "blue" }}>Wiseling</a>
      </div> */}
      {/* <Divider sx={{ mt: 1, mb: 2 }} /> */}
      <div>
        <OtherPageLink />
        {/* <TabGroup tabs={["公開題目", "公開題庫"]}>
          <ProblemList />
          <h1 className="text-3xl font-bold pt-4">
            公開題庫
          </h1>
        </TabGroup> */}
        <ProblemList />
      </div>
    </Box>
  )
}

export default Index;