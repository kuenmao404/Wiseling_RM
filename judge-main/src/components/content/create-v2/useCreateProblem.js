import { atom, useAtomValue } from 'jotai';
import { atomWithStorage, RESET } from 'jotai/utils';

/**
 * @typedef CreateProblemState
 * @type {object}
 * @property {number|null} pid
 * @property {number|null} cid
 * @property {{input: string, output: string}[]} samples
 * @property {{input: string, output: string}[]} testcases
 * @property {number[]} supportedLangs
 */

/** @type {CreateProblemState} */
const initCreateProblemState = {
  pid: null,
  cid: null,
  title: '',
  statement: '',
  inSpec: '',
  outSpec: '',
  solution: '',
  solutionLang: '',
  timeLimit: null,
  memoryLimit: null,
  difficulty: 1,
  supportedLangs: [],
  tags: '',
  samples: [],
  hints: [],
  testcases: [],
  currentStep: 1,
  changed: false,
};

const createProblemAtom = atomWithStorage('createProblem', initCreateProblemState);

export const setCreateProblemAtom = atom(null, (get, set, newValue) => {
  set(
    createProblemAtom,
    newValue === RESET
      ? initCreateProblemState
      : {
          ...get(createProblemAtom),
          ...{ changed: true },
          ...newValue,
        },
  );
});

export const setNextStepAtom = atom(null, (get, set) => {
  set(createProblemAtom, (state) => ({ ...state, currentStep: Math.min(state.currentStep + 1, 9) }));
});
export const setPrevStepAtom = atom(null, (get, set) => {
  set(createProblemAtom, (state) => ({ ...state, currentStep: Math.max(state.currentStep - 1, 1) }));
});

const sourceAtom = atom((get) => {
  const { statement, inSpec, outSpec, samples, hints } = get(createProblemAtom);
  const source = `<br />
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
`,
  )
  .join('')}
`;
  return source;
});

export const useCreateProblem = () => {
  const state = useAtomValue(createProblemAtom);
  const source = useAtomValue(sourceAtom);
  return { ...state, source };
};
