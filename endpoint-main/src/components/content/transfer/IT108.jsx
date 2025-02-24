import React, { useEffect } from 'react'
import { Box, Button } from '@mui/material'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import MarkdownView from '../../elements/markdown/MarkdownView'
import Loading from '../../elements/loading/index'
import { transferIT108 } from 'apis'

export default function IT108({
  margin
}) {
  const [searchParams] = useSearchParams()
  const state = searchParams.get('state')

  const navigate = useNavigate()

  const transferIT108Api = useMutation({ mutationFn: transferIT108 })

  useEffect(() => {
    transferIT108Api.mutate({ state })
  }, [])

  return (
    <Box sx={{ padding: margin, backgroundColor: "#fff", width: "100%" }} className="flex-1-1">
      <MarkdownView
        source={
          `
# IT108帳號轉移

網站架構搬遷，將重新轉移您的資料到新系統。

## 包含
- 筆記
- 影片收藏清單
- 隨選播放清單

## 不包含
- 課程資料
- 觀看紀錄
`
        }
      />
      {!!transferIT108Api.isPending ?
        <Box className="flex aic jcc flex-col" sx={{ mt: 3, mb: 1 }}>
          <Loading />
          <Box sx={{ mt: 1 }}>資料轉移中...</Box>
        </Box> :
        <Box className="flex aic jcc flex-col" sx={{ mt: 3, mb: 1 }}>
          <Box sx={{ mt: 1 }}>{transferIT108Api?.data?.body?.message}！</Box>
          <Box sx={{ mt: 2 }}>
            <Button onClick={() => navigate(`${transferIT108Api?.data?.body?.state}`)} variant='contained' color='success'>
              點我反回頁面
            </Button>
          </Box>
        </Box>
      }
    </Box>
  )
}
