import { createContext, useContext } from 'react'

export const InsideContainerContext = createContext(false)

export function useInsideContainer(): boolean {
  return useContext(InsideContainerContext)
}
