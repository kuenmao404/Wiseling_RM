import {
  createProblem,
  getJudgeRoot,
  getProblem,
  getProblemBackSide,
  getProblemSolution,
  getSupportLanguage,
  updateProblemSolution,
} from '@/apis';
import { accountAtom } from '@/components/App';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/elements/accordion/Accordion';
import MarkdownPreview from '@/components/elements/markdown/MarkdownPreview';
import { Button } from '@/components/elements/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/elements/ui/Card';
import { Input } from '@/components/elements/ui/Input';
import { Label } from '@/components/elements/ui/Label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/elements/ui/Dialog';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { setCreateProblemAtom, setNextStepAtom, setPrevStepAtom, useCreateProblem } from './useCreateProblem';
import { RenderStep } from './RenderStep';
import { editorStorageAtom, setLanguageAtom } from './editor/useEditor';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { RESET } from 'jotai/utils';

const bOPAtom = atom((get) => {
  return get(accountAtom)?.bOP || get(accountAtom)?.bJudgeOP;
});

const loadProblemOpenAtom = atom(false);
const inputPIDAtom = atom('');

export default function CreateProblem() {
  const {
    pid,
    title,
    statement,
    inSpec,
    outSpec,
    supportedLangs,
    timeLimit,
    memoryLimit,
    difficulty,
    tags,
    samples,
    hints,
    testcases,
    //currentStep,
    source,
    changed,
  } = useCreateProblem();
  const setCreateState = useSetAtom(setCreateProblemAtom);
  //const setNextStep = useSetAtom(setNextStepAtom);
  //const setPrevStep = useSetAtom(setPrevStepAtom);
  const setLanguage = useSetAtom(setLanguageAtom);
  const setEditorStorage = useSetAtom(editorStorageAtom);
  const bOP = useAtomValue(bOPAtom);
  const acc = useAtomValue(accountAtom);
  const [loadProblemOpen, setLoadProblemOpen] = useAtom(loadProblemOpenAtom);
  const [inputPID, setInputPID] = useAtom(inputPIDAtom);
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const step = Number.parseInt(searchParams.get('step')) || 1;
  const setNextStep = () => {
    setSearchParams({ step: Math.min(step + 1, 9) });
  };
  const setPrevStep = () => {
    setSearchParams({ step: Math.max(step - 1, 1) });
  };

  let params = useParams();
  const { pid: __param_pid } = params;
  const param_pid = Number.parseInt(__param_pid);

  // APIs
  const getJudgeRootApi = useQuery({
    queryKey: ['getJudgeRoot'],
    queryFn: getJudgeRoot,
  });
  const problemCID = getJudgeRootApi?.data?.problemCID;

  const createProblemApi = useMutation({
    mutationFn: createProblem,
    onSuccess: (data, variables, context) => {
      if (data.ok) {
        setCreateState({
          pid: data.body.pid,
          currentStep: currentStep + 1,
        });
      }
    },
  });

  const getProblemApi = useQuery({
    queryKey: ['getProblem', param_pid],
    queryFn: () => getProblem({ pid: param_pid }),
    enabled: !!param_pid,
  });
  const pdata = getProblemApi?.data;
  const getProblemBackSideApi = useQuery({
    queryKey: ['getProblemBackSide', param_pid],
    queryFn: () => getProblemBackSide({ pid: param_pid }),
    enabled: !!param_pid,
  });
  const solutionCID = getProblemBackSideApi?.data?.find?.((f) => f.cname == '範例程式')?.cid;

  const getSupportLanguageApi = useQuery({
    queryKey: ['getSupportLanguage'],
    queryFn: getSupportLanguage,
    enabled: !!param_pid,
  });

  const getProblemSolutionApi = useQuery({
    queryKey: ['getProblemSolution', param_pid, bOP],
    queryFn: () => getProblemSolution({ pid: param_pid, cid: solutionCID }),
    enabled: !!param_pid && !!solutionCID,
  });

  const updateProblemSolutionApi = useMutation({
    mutationFn: updateProblemSolution,
    onSuccess: getProblemSolutionApi.refetch,
  });

  useEffect(() => {
    const { text, name } = getProblemSolutionApi?.data || {};
    if (text) {
      console.log(getProblemSolutionApi?.data);
      setLanguage(getSupportLanguageApi?.data?.find?.((f) => f.name == name));
      setEditorStorage((state) => ({ ...state, code: text }));
    }
  }, [getProblemSolutionApi?.data]);

  useEffect(() => {
    if (!param_pid) {
      setCreateState(RESET);
    }
    if (!!param_pid && getProblemApi.isSuccess) {
      setCreateState({
        pid: pdata?.pid,
        title: pdata?.title,
        statement: pdata?.statement,
        cid: pdata?.cid,
        difficulty: pdata?.difficulty,
        inSpec: pdata?.in_spec,
        outSpec: pdata?.out_spec,
        timeLimit: pdata?.time_limit,
        memoryLimit: pdata?.mem_limit,
        supportedLangs: JSON.parse(pdata?.lang || '[]').map((l) => l.plid),
        tags: '', // todo
        samples: JSON.parse(pdata?.sample_tests || '[]'),
        hints: JSON.parse(pdata?.hints || '[]'),
        currentStep: 1,
        changed: false,
      });
    }
  }, [getProblemApi?.data]);

  if (!getProblemApi?.isFetching && !pdata?.pid && !!param_pid) {
    navigate('/create-v2');
  }

  const clickNextHandler = () => {
    if (step <= 5 || !!pid) {
      setNextStep();
    }
    // 新增題目如果不存在
    else if (step === 6) {
      if (pid === null && !!problemCID) {
        createProblemApi.mutate({
          cid: problemCID,
          title,
          statement,
          in_spec: inSpec,
          out_spec: outSpec,
          sample_tests: '[]',
          hints: JSON.stringify(hints),
          langIDstr: supportedLangs.join(','),
          tagIDstr: tags,
          difficulty,
          time_limit: timeLimit,
          mem_limit: memoryLimit,
        });
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-3xl font-bold">新增題目（使用Markdown語法）{getProblemApi.isFetching}</h1>
      <div className="flex flex-col gap-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Step {step} of 9</CardTitle>
            <Label className="flex items-center gap-2 font-semibold leading-none tracking-tight">
              Load Problem
              <Input
                type="number"
                className="w-24"
                placeholder="輸入PID"
                value={inputPID}
                onChange={(e) => setInputPID(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    setLoadProblemOpen(true);
                  }
                }}
              />
              <Button
                disabled={!changed}
                onClick={() => {
                  setLoadProblemOpen(true);
                }}
              >
                Load
              </Button>
              <Dialog open={loadProblemOpen} onOpenChange={setLoadProblemOpen}>
                <DialogContent className="w-72">
                  <DialogHeader>
                    <DialogTitle>確認要載入題目？</DialogTitle>
                    <DialogDescription>
                      目前的題目將會被覆蓋
                      <span className="mt-4 flex w-full flex-row-reverse gap-2">
                        <Button size="sm" variant="" onClick={() => setLoadProblemOpen(false)}>
                          取消
                        </Button>
                        <Button
                          onClick={() => {
                            setCreateState({ pid: Number.parseInt(inputPID) });
                            getProblemApi.refetch();
                            setLoadProblemOpen(false);
                          }}
                          size="sm"
                          variant="destructive"
                        >
                          確認
                        </Button>
                      </span>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </Label>
          </CardHeader>
          <CardContent>
            <RenderStep
              step={step}
              problemData={pdata}
              langs={getSupportLanguageApi?.data}
              updateProblemSolutionApi={updateProblemSolutionApi}
              solutionCID={solutionCID}
            />
            <div className="mt-6 flex justify-between">
              <Button onClick={setPrevStep} disabled={step === 1}>
                <ChevronLeftIcon className="mr-2 h-4 w-4" /> Previous
              </Button>
              <Button onClick={clickNextHandler}>
                {!pid && step === 6 ? 'Create' : step !== 9 ? 'Next' : 'Finish'}
                {/* {currentStep !== 9 ? "Next" : "Finish"} */}
                {step !== 9 && <ChevronRightIcon className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>預覽</CardTitle>
          </CardHeader>
          <CardContent>
            <h1 className="pt-2 text-3xl font-bold">{title}</h1>
            <MarkdownPreview className="" source={source} />
            <Accordion type="multiple" className="w-full">
              {hints.map((hint, idx) => (
                <AccordionItem key={idx} value={'hint' + idx}>
                  <AccordionTrigger className="">
                    <div className="flex items-center justify-start gap-2">
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
          </CardContent>
        </Card>
      </div>
      <br />
      <Button
        onClick={() => {
          console.log(step);
        }}
      >
        Debug
      </Button>
    </div>
  );
}
