import { create } from 'zustand'
import log from '../lib/log'

const initialState = {
  open: false,
  title: "",
  content: null,
  actions: null,
  body: null,
  fullWidth: false,
  maxWidth: false,
  disableScrollLock: false,
  isRwdWidth: false,
}

const useDialogStore = create(
  log((set) => ({
    ...initialState,
    setDialog: (data) => set({ ...initialState, ...data, open: true }),
    handleClose: () => set({ open: false })
  }))
)

export default useDialogStore