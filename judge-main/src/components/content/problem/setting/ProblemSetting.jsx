import React, { useEffect } from 'react'
import { cn } from '../../../../lib/utils'
import { Link } from 'react-router-dom'
import { Button, Chip, Rating } from '@mui/material'
import MarkdownPreview from '../../../elements/markdown/MarkdownPreview'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../../elements/accordion/Accordion'
import { Editor } from '../components/solution_editor'
import { getProblemSolution, updateProblemSolution, getProblemTestCase, updateProblemTestCase, delProblemTestCase } from '../../../../apis'
import { useQuery, useMutation } from '@tanstack/react-query'
import useApiDataStore from '../../../../store/apidata'
import { editorStorageAtom, setLanguageAtom } from '../components/solution_editor/UseEditor'
import { useSetAtom } from 'jotai'
import TestCaseTable from './TestCaseTable'
import TestCaseDialog from './TestCaseDialog'
import useDialogStore from '../../../../store/dialog'
import { ChevronLeftIcon } from '@radix-ui/react-icons'

export default function ProblemSetting(props) {
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
      return JSON.parse(tag)
    }
    else {
      return tag
    }
  }

  const { setDialog, closeDialog } = useDialogStore()

  const setEditorStorage = useSetAtom(editorStorageAtom)
  const updateLanguage = useSetAtom(setLanguageAtom)

  const { data } = useApiDataStore("getProblemBackSide")

  const cid = data?.find(f => f.cname == "範例程式")?.cid

  const getProblemSolutionApi = useQuery({
    queryKey: ["getProblemSolution", pid, cid, bOP],
    queryFn: () => getProblemSolution({ pid, cid }),
    enabled: !!pid && !!bOP && !!cid,
  })
  const updateProblemSolutionApi = useMutation({ mutationFn: updateProblemSolution, onSuccess: () => getProblemSolutionApi.refetch() })

  const testcase_cid = data?.find(f => f.cname == "測資")?.cid

  const getProblemTestCaseApi = useQuery({
    queryKey: ["getProblemTestCase", pid, testcase_cid, bOP],
    queryFn: () => getProblemTestCase({ pid, cid: testcase_cid }),
    enabled: !!pid && !!bOP && !!testcase_cid,
  })
  const updateProblemTestCaseApi = useMutation({ mutationFn: updateProblemTestCase, onSuccess: () => getProblemTestCaseApi.refetch() })
  const delProblemTestCaseApi = useMutation({ mutationFn: delProblemTestCase, onSuccess: () => getProblemTestCaseApi.refetch() })

  useEffect(() => {
    const { text, name } = (getProblemSolutionApi?.data || {})
    if (text) {
      updateLanguage(lang?.find?.(f => f.name == name))
      setEditorStorage((state) => ({ ...state, code: text }));
    }
  }, [getProblemSolutionApi?.data])

  const handleAddTestCaseBtn = ({ pid, cid }) => {
    setDialog({
      title: "新增測資",
      handleClose: closeDialog,
      body: (
        <TestCaseDialog
          handleSubmit={
            (d, callback) =>
              updateProblemTestCaseApi.mutate({ pid, cid, ...d }, { onSuccess: (_d) => (callback(), _d?.body?.status && closeDialog()) })}
        />
      )
    })
  }

  return (
    <div className={cn("flex flex-col p-4", className)} {...otherProps}>
      <div>
        <Link to={`/problem/${pid}`}>
          <Button startIcon={<ChevronLeftIcon fontSize='small' />}>返回</Button>
        </Link>
      </div>
      <hr className='my-2' />
      <h1 className="text-3xl font-bold pt-2">
        難易度
      </h1>
      <div>
        <Rating value={difficulty || 0} readOnly />
      </div>
      <hr className='my-2' />
      <h1 className="text-3xl font-bold pt-2">
        標籤
      </h1>
      <div>
        {(tansTag(tags) || [])?.map((d, idx) =>
          <Chip sx={{ ml: 1 }} label={d?.cname} key={idx} size="small" />)}
      </div>
      <hr className='my-2' />
      <h1 className="text-3xl font-bold pt-2">
        標題
      </h1>
      <div>
        {title}
      </div>
      <hr className='my-2' />
      <h1 className="text-3xl font-bold pt-2">
        題目說明
      </h1>
      <div>
        <MarkdownPreview
          source={`${statement}`}
        />
      </div>
      <hr className='my-2' />
      <h1 className="text-3xl font-bold pt-2">
        輸入說明
      </h1>
      <div>
        <MarkdownPreview
          source={`${inSpec}`}
        />
      </div>
      <hr className='my-2' />
      <h1 className="text-3xl font-bold pt-2">
        輸出說明
      </h1>
      <div>
        <MarkdownPreview
          source={`${outSpec}`}
        />
      </div>
      <hr className='my-2' />
      <h1 className="text-3xl font-bold pt-2">
        範例測資
      </h1>
      <div>
        <MarkdownPreview
          source={`${samples
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
            .join("")}`}
        />
      </div>
      <hr className='my-2' />
      <h1 className="text-3xl font-bold pt-2">
        Hints
      </h1>
      <div>
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
      <hr className='my-2' />
      <h1 className="text-3xl font-bold pt-2">
        範例程式
      </h1>
      <div className='min-h-96'>
        <Editor
          pid={pid}
          lang={lang}
          onSubmitClick={(d) => updateProblemSolutionApi.mutate({ cid, ...d })}
        />
      </div>
      <hr className='my-2' />
      <div className='flex jcsb aic'>
        <h1 className="text-3xl font-bold pt-2">
          測資
        </h1>
        <Button color="success" variant="contained" onClick={() => handleAddTestCaseBtn({ pid, cid: testcase_cid })}>
          新增測資
        </Button>
      </div>
      <div>
        <TestCaseTable
          data={getProblemTestCaseApi?.data}
          handleDelete={({ cid, tcid }) => { delProblemTestCaseApi.mutate({ pid, cid, tcid }) }}
        />
      </div>
    </div>
  )
}
