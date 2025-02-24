import { create } from 'zustand'
import log from '../lib/log'

const initialState = {
  open: false,
  message: null,
  anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
  autoHideDuration: 3000,
  status: null,
  direction: "up"
}

const useSnackbarStore = create(
  log((set) => ({
    ...initialState,
    setSnackMsg: (data) => set({ ...data, open: true }),
    closeSnackbar: () => set(initialState)
  }))
)

export default useSnackbarStore