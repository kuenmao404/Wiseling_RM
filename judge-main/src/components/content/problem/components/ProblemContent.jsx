import React from 'react'
import { Rating, Divider, Chip, Box, Button, IconButton, Tooltip } from '@mui/material'
import { Settings } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import MarkdownPreview from '../../../elements/markdown/MarkdownPreview'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../../elements/accordion/Accordion'
import { TabGroup } from '../../../elements/tab'
import { cn } from '../../../../lib/utils'
import Comments from './comment'
import History from './history'

export default function ProblemContent(props) {
  const {
    pid,
    title,
    statement,
    inSpec,
    outSpec,
    sampleTests,
    hints,
    className,
    difficulty,
    tags,
    handleReport,
    lang,
    bOP,
    ...otherProps
  } = props

  const samples = JSON?.parse(sampleTests || "[]")
  const hintsArr = JSON?.parse(hints || "[]")

  const tansTag = (tag) => {
    if (typeof tag === "string") {
      return JSON.parse(tag || "[]")
    }
    else {
      return tag
    }
  }

  const navigate = useNavigate()

  return (
    <div className={cn("flex flex-col", className)} {...otherProps}>
      <TabGroup tabs={[{ name: '題目', path: "/" }, { name: '討論區', path: "/comment" }, { name: '提交紀錄', path: "/history" }]} baseUrl={`/problem/${pid}`}>{/** , { name: '討論區', path: "/comment" } */}
        <div className="h-full flex flex-col gap-2 overflow-auto p-4">
          <div className='flex aic jcsb'>
            <Box className="flex aic fww">
              <Rating value={difficulty || 0} readOnly />
              <div>
                {(tansTag(tags) || [])?.map((d, idx) =>
                  <Chip sx={{ ml: 1 }} label={d?.cname} key={idx} size="small" />)}
              </div>
            </Box>
            <Box>
              <Button color='error' size='small' onClick={() => handleReport()}>錯誤回報</Button>
              {!!bOP &&
                <Tooltip title="題目設定">
                  <IconButton size='small' onClick={() => navigate(`/problem/${pid}/setting`)}><Settings fontSize='small' /></IconButton>
                </Tooltip>
              }
            </Box>
          </div>
          <Divider />
          <h1 className="text-3xl font-bold pt-2">{title}</h1>
          <MarkdownPreview
            // wrapperElement={{ "data-color-mode": "light" }}
            // className="h-full overflow-auto p-2.5"
            className=""
            source={`
${statement}\n
## 輸入說明
${inSpec}\n
## 輸出說明
${outSpec}\n
## 範例測資
${samples
                .map(
                  (sample, idx) => `
### 範例 ${idx + 1}
#### 輸入
\`\`\`
${sample.input}
\`\`\`
#### 輸出
\`\`\`
${sample.output}
\`\`\`
`
                )
                .join("")}
`}
          />
          <Accordion type="multiple" className="w-full">
            {hintsArr.map((hint, idx) => (
              <AccordionItem key={idx} value={"hint" + idx}>
                <AccordionTrigger className="">
                  <div className="flex items-center gap-2 justify-start">
                    {/** 燈泡icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-lightbulb"
                    >
                      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
                      <path d="M9 18h6" />
                      <path d="M10 22h4" />
                    </svg>
                    <span>Hint {idx + 1}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <MarkdownPreview source={hint} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        <div className="h-full flex flex-col overflow-auto">
          <Comments pid={pid} />
        </div>
        <div className="h-full flex flex-col gap-2 overflow-auto p-4">
          <History pid={pid} lang={lang} />
        </div>
      </TabGroup>
    </div>
  )
}
