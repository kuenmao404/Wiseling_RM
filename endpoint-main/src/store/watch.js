import { create } from 'zustand'
import log from '../lib/log'

const initialState = {
  isEditing: false,
}

const useWatchStore = create(
  log((set) => ({
    ...initialState,
    setEditing: (tf) => set({ isEditing: tf }),
  }))
)

export default useWatchStore