import { create } from 'zustand'
import log from '../lib/log'

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


const useAccountStore = create(
  log((set) => ({
    ...initialState,
    setAccount: (data) => set({ ...data, subclass: JSON.parse(data?.data || "[]"), isLogin: (data?.mid == 0 || !data?.mid) ? false : true }),
  }))
)

export default useAccountStore