import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'

const initialState = {
}

const stateAtom = atom(initialState,
  async (get, set, data) => {
    let state = get(stateAtom)
    // console.log('setData', { ...state, ...data })
    set(stateAtom, { ...state, ...data })
  }
)

const useApiDataStore = (apikey = null) => {
  const [state, setData] = useAtom(stateAtom)

  const setApiData = ({ key, body }) => {
    console.log(`apiDataAtom log (${key}):`, { [key]: body })
    setData({ [key]: body })
  }

  if (apikey !== null)
    return useAtomValue(stateAtom)?.[apikey]

  return { ...useAtomValue(stateAtom), setApiData }
}

export default useApiDataStore