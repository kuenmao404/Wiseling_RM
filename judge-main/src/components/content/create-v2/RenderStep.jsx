import MarkdownEditor from '@/components/elements/markdown/MarkdownEditor';
import { Button } from '@/components/elements/ui/Button';
import { Card } from '@/components/elements/ui/Card';
import { Input } from '@/components/elements/ui/Input';
import { Textarea } from '@/components/elements/ui/Textarea';
import { Rating } from '@mui/material';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useSetAtom } from 'jotai';
import { Editor } from './editor';
import LanguageSelector from './LanguageSelector';
import { setCreateProblemAtom, useCreateProblem } from './useCreateProblem';

/**
 * @typedef {Object} RenderStepProps
 * @property {any} problemData
 * @property {any} langs
 * @property {any} updateProblemSolutionApi
 * @property {number} solutionCID
 */

/** @param {RenderStepProps} props */
export function RenderStep({ step, problemData: pdata, langs, updateProblemSolutionApi, solutionCID }) {
  const setCreateState = useSetAtom(setCreateProblemAtom);
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
    //currentStep: step,
    source,
  } = useCreateProblem();

  switch (step) {
    case 1:
      return (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{step}. 標題</h2>
          <Input placeholder="輸入題目標題" value={title} onChange={(e) => setCreateState({ title: e.target.value })} />
        </div>
      );
    case 2:
      return (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{step}. 題目描述</h2>
          <MarkdownEditor
            height="24rem"
            value={statement}
            onChange={(value) => setCreateState({ statement: value })}
            autoFocus={true}
            enablePreview={false}
          />
        </div>
      );
    case 3:
      return (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{step}. 輸入說明</h2>
          <MarkdownEditor
            height="24rem"
            value={inSpec}
            onChange={(value) => setCreateState({ inSpec: value })}
            autoFocus={true}
            enablePreview={false}
          />
        </div>
      );
    case 4:
      return (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{step}. 輸出說明</h2>
          <MarkdownEditor
            height="24rem"
            value={outSpec}
            onChange={(value) => setCreateState({ outSpec: value })}
            autoFocus={true}
            enablePreview={false}
          />
        </div>
      );
    case 5:
      return (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{step}. 新增提示 (Hints)</h2>
          {hints.map((hint, index) => {
            return (
              <Card key={`hint-${index}`} className="relative mb-4 p-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-1 top-1"
                  onClick={() => {
                    const newHints = [...hints];
                    newHints.splice(index, 1);
                    setCreateState({ hints: newHints });
                  }}
                >
                  <Cross2Icon className="h-4 w-4" />
                </Button>
                <MarkdownEditor
                  height="14rem"
                  value={hint}
                  onChange={(value) => {
                    const newHints = [...hints];
                    newHints[index] = value;
                    setCreateState({ hints: newHints });
                  }}
                  autoFocus={true}
                  enablePreview={false}
                />
              </Card>
            );
          })}
          <Button onClick={() => setCreateState({ hints: [...hints, ''] })}>新增提示</Button>
        </div>
      );
    case 6:
      return (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{step}. 題目設定</h2>
          <div className="flex gap-2">
            <div className="text-xl font-bold">難度</div>
            <Rating value={difficulty} onChange={(_, value) => setCreateState({ difficulty: value })} />
          </div>
          <div className="text-xl font-bold">時間限制 (ms)</div>
          <Input
            placeholder="輸入時間限制 (ms) default: 1000"
            type="number"
            value={timeLimit}
            onChange={(e) => setCreateState({ timeLimit: parseInt(e.target.value, 10) })}
          />
          <div className="text-xl font-bold">記憶體限制 (MB)</div>
          <Input
            placeholder="輸入記憶體限制 (MB) default: 256"
            type="number"
            value={memoryLimit}
            onChange={(e) => setCreateState({ memoryLimit: parseInt(e.target.value, 10) })}
          />
          <div className="text-xl font-bold">標籤</div>
          <Input placeholder="輸入標籤" value={tags} onChange={(e) => setCreateState({ tags: e.target.value })} />
          <div className="text-xl font-bold">Enable Language</div>
          <LanguageSelector
            onCheckedChange={(checked, plid) => {
              if (plid === 'ALL') {
                if (checked) {
                  setCreateState({
                    supportedLangs: langs.map((lang) => lang.plid),
                  });
                } else {
                  setCreateState({ supportedLangs: [] });
                }
              } else {
                if (checked) {
                  setCreateState({
                    supportedLangs: [...supportedLangs, plid],
                  });
                } else {
                  setCreateState({
                    supportedLangs: supportedLangs.filter((lang) => lang !== plid),
                  });
                }
              }
            }}
            selected={supportedLangs}
            langs={langs || []}
          />
        </div>
      );
    case 7:
      return (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{step}. 新增題目解答 (Solution)</h2>
          <div className="h-96">
            <Editor
              pid={pid}
              onChange={(value) => setCreateState({ solution: value })}
              onSubmitClick={(d) => {
                console.log(d);
                updateProblemSolutionApi.mutate({ cid: solutionCID, ...d });
              }}
              lang={JSON.parse(pdata?.lang || 'null')}
            />
          </div>
        </div>
      );
    case 8:
      return (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{step}. 新增範例測資</h2>
          {samples.map((s, index) => {
            return (
              <Card key={`sample-${index}`} className="relative mb-4 p-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-1 top-1"
                  onClick={() => {
                    const newSamples = [...samples];
                    newSamples.splice(index, 1);
                    setCreateState({ samples: newSamples });
                  }}
                >
                  <Cross2Icon className="h-4 w-4" />
                </Button>
                <div className="flex gap-2">
                  <Textarea
                    className="h-72 w-1/2"
                    onChange={(e) => {
                      const newSamples = [...samples];
                      newSamples[index].input = e.target.value;
                      setCreateState({ samples: newSamples });
                    }}
                  />
                  <pre cont className="h-72 w-1/2 overflow-y-auto">
                    {s.input}
                  </pre>
                </div>
                <Button className="absolute bottom-2 right-2">產生輸出</Button>
              </Card>
            );
          })}
          <Button
            onClick={() =>
              setCreateState({
                samples: [...samples, { input: '', output: '' }],
              })
            }
          >
            新增一筆範例測資
          </Button>
        </div>
      );
    case 9:
      return (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{step}. 新增測資</h2>
          {testcases.map((s, index) => {
            return (
              <Card key={`test-${index}`} className="relative mb-4 p-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-1 top-1"
                  onClick={() => {
                    const newTestcases = [...testcases];
                    newTestcases.splice(index, 1);
                    setCreateState({ testcases: newTestcases });
                  }}
                >
                  <Cross2Icon className="h-4 w-4" />
                </Button>
                <div className="flex gap-2">
                  <Textarea
                    className="h-72 w-1/2"
                    onChange={(e) => {
                      const newTestcases = [...testcases];
                      newTestcases[index].input = e.target.value;
                      setCreateState({ samples: newTestcases });
                    }}
                  />
                  <pre cont className="h-72 w-1/2 overflow-y-auto">
                    {s.input}
                  </pre>
                </div>
                <Button className="absolute bottom-2 right-2">產生輸出</Button>
              </Card>
            );
          })}
          <Button
            onClick={() =>
              setCreateState({
                testcases: [...testcases, { input: '', output: '' }],
              })
            }
          >
            新增一筆測資
          </Button>
        </div>
      );
    default:
      return null;
  }
}
