import { create } from 'zustand'
import log from '../lib/log'
import Config from 'Config'

const initialState = {
  title: Config?.title || 'WiseLing',
  isDrawerOpen: true,
}

const useAppStore = create(
  log((set) => ({
    ...initialState,
    setDrawerOpen: (tf = null) => set(state => ({ isDrawerOpen: tf !== null ? tf : !state.isDrawerOpen })),
    setTitle: (title) => set({ title })
  }))
)

export default useAppStore