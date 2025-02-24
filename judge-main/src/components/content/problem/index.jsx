import React, { useState, useEffect, Fragment } from 'react'
import { Box } from '@mui/material';
import ProblemContent from './components/ProblemContent';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../../elements/resizable/Resizable';
import { useParams, Route, Routes } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query';
import { getProblem, getProblemBackSide, submitProblem, getProblemSolveHistory } from '../../../apis';
import { Editor } from './components/editor'
import { Console } from './components/Console';
import LoadingWrapper from '../../elements/wrapper/LoadingWrapper'
import NotFind from '../NotFind';
import Dialog from '../../elements/dialog/Dialog'
import ErrorReport from '../../elements/dialog/ErrorReport';
import { accountAtom } from '../../App';
import { useAtom, useSetAtom } from 'jotai';
import ProblemSetting from './setting/ProblemSetting';
import useApiDataStore from '../../../store/apidata';
import { useInfiniteQueryAtom } from '../../../lib/infiniteQuery';

import { cn } from "../../../lib/utils";

function index() {
  const [isColHandleDragging, setIsColHandleDragging] = useState(false);
  const [isRowHandleDragging, setIsRowHandleDragging] = useState(false);
  const [open, setOpen] = useState(false)

  const [account] = useAtom(accountAtom)
  const { getProblemSolveHistory } = useInfiniteQueryAtom()

  let params = useParams()
  const { pid } = params

  const getProblemApi = useQuery({ queryKey: ['getProblem', pid], queryFn: () => getProblem({ pid }), enabled: !!pid })
  const { ...problem_data } = getProblemApi?.data || {}

  useQuery({ queryKey: ['_getProblemBackSide', pid], queryFn: () => getProblemBackSide({ pid }), enabled: !!pid })

  const submitProblemApi = useMutation({
    mutationFn: submitProblem, onSuccess: () => getProblemSolveHistory?.refetch?.()
  })

  const handleSubmitProblem = (d) => {
    submitProblemApi.mutate({ ...d })
  }

  if (!getProblemApi?.isFetching && !problem_data?.pid) {
    return (
      <NotFind />
    )
  }

  return (
    <LoadingWrapper query={getProblemApi}>
      <Routes>
        {account?.isLoading === false && (account?.bOP || account?.bJudgeOP) &&
          <Route
            path="/setting"
            element={
              <ProblemSetting
                className="w-full min-h-full overflow-auto"
                pid={parseInt(pid)}
                title={problem_data.title}
                statement={problem_data.statement}
                inSpec={problem_data.in_spec}
                outSpec={problem_data.out_spec}
                sampleTests={problem_data.sample_tests}
                hints={problem_data.hints}
                difficulty={problem_data.difficulty}
                tags={problem_data.tags}
                lang={JSON.parse(problem_data?.lang || "null")}
                handleReport={() => setOpen(true)}
                bOP={account?.bOP || account?.bJudgeOP}
              // history={getProblemSolveHistoryApi?.data}
              />
            }
          />
        }
        <Route
          path="*"
          element={
            <Fragment>
              <Dialog
                open={open}
                title="錯誤回報"
                handleClose={() => setOpen(false)}
                body={
                  <ErrorReport
                    oid={pid}
                    handleClose={() => setOpen(false)}
                  />
                }
              />
              <Box className="w-full" sx={{ height: "calc(100vh - 64px)" }}>
                <ResizablePanelGroup direction="horizontal">
                  <ResizablePanel className="" defaultSize={50}>
                    <ProblemContent
                      className="h-full w-full overflow-hidden"
                      pid={pid}
                      title={problem_data.title}
                      statement={problem_data.statement}
                      inSpec={problem_data.in_spec}
                      outSpec={problem_data.out_spec}
                      sampleTests={problem_data.sample_tests}
                      hints={problem_data.hints}
                      difficulty={problem_data.difficulty}
                      tags={problem_data.tags}
                      lang={JSON.parse(problem_data?.lang || "null")}
                      handleReport={() => setOpen(true)}
                      bOP={account?.bOP || account?.bJudgeOP}
                    // history={getProblemSolveHistoryApi?.data}
                    />
                  </ResizablePanel>
                  <ResizableHandle
                    onDragging={setIsColHandleDragging}
                    withHandle
                    style={{ width: "0.25rem" }}
                    className={cn("hover:bg-blue-500 z-30", {
                      "bg-blue-500": isColHandleDragging,
                    })}
                  />
                  <ResizablePanel className="relative" defaultSize={50}>
                    <LoginMask>
                      <EnableMask bTestCase={problem_data?.bTestCase}>
                        <ResizablePanelGroup direction="vertical">
                          <ResizablePanel defaultSize={60}>
                            <Editor
                              pid={problem_data.pid}
                              lang={JSON.parse(problem_data?.lang || "null")}
                              onSubmitClick={handleSubmitProblem}
                              isLoading={submitProblemApi?.isPending}
                            />
                          </ResizablePanel>
                          <ResizableHandle
                            onDragging={setIsRowHandleDragging}
                            withHandle
                            style={{ height: "0.25rem" }}
                            className={cn("hover:bg-blue-500", {
                              "bg-blue-500": isRowHandleDragging,
                            })}
                          />
                          <ResizablePanel defaultSize={40} minSize={10} collapsible>
                            <Console
                              className="w-full h-full"
                              isLoading={submitProblemApi?.isPending}
                              data={submitProblemApi?.data?.body}
                            />
                          </ResizablePanel>
                        </ResizablePanelGroup>
                      </EnableMask>
                    </LoginMask>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </Box>
            </Fragment>
          }
        />
      </Routes>
    </LoadingWrapper>
  )
}

export default index

const LoginMask = ({
  children,
  ...props
}) => {
  const [account] = useAtom(accountAtom)

  return account.isLogin ?
    <div className='mx-1 h-full'>{children}</div> : (
      <div className="h-full relative">
        <div className='mx-1 h-full'>{children}</div>
        <div className='absolute inset-0 bg-black/40 z-20 flex jcc aic'>
          {!account.isLoading && <span className='text-white'>登入後解鎖</span>}
        </div>
      </div>
    )
}

const EnableMask = ({
  children,
  bTestCase,
  ...props
}) => {
  const [account] = useAtom(accountAtom)

  return (bTestCase || !account.isLogin) ?
    <div className='mx-1 h-full'>{children}</div> : (
      <div className="h-full relative">
        <div className='mx-1 h-full'>{children}</div>
        <div className='absolute inset-0 bg-black/40 z-20 flex jcc aic'>
          {!account.isLoading && <span className='text-white'>題目尚未開放</span>}
        </div>
      </div>
    )
}