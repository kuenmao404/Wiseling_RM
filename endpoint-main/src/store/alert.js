import { create } from 'zustand'
import log from '../lib/log'

const initialState = {
  open: false,
  title: "",
  content: "",
  handleAgree: () => { },
  handleDisagree: () => { },
}

const useAlertStore = create(
  log((set) => ({
    ...initialState,
    setAlert: (data) => set({ ...initialState, ...data, open: true }),
    handleClose: () => set({ open: false })
  }))
)

export default useAlertStore