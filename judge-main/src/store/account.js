import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'


const initialState = {
  mid: null,
  name: "訪客",
  account: null,
  email: null,
  sso: null,
  lastLoginDT: null,
  isLogin: null,
  refetch: null,
}

const stateAtom = atom(initialState,
  async (get, set, data) => {
    let state = get(stateAtom)
    set(stateAtom, { ...state, ...data })
  }
)

const useAccountStore = () => {
  const setData = useSetAtom(stateAtom)
  const setAccount = (data) => {
    if (data?.mid === 0) {
      localStorage.removeItem("editor");
    }
    setData({ ...data, isLogin: (data?.mid == 0 || !data?.mid) ? false : true })
  }

  return { ...useAtomValue(stateAtom), setAccount }
}

export default useAccountStore