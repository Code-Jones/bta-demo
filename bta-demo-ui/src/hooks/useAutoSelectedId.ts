import { useEffect } from 'react'

type AutoSelectedIdProps<T> = {
  items: T[]
  selectedId: string | null
  setSelectedId: (value: string | null) => void
  getId: (item: T) => string
}

export function useAutoSelectedId<T>({
  items,
  selectedId,
  setSelectedId,
  getId,
}: AutoSelectedIdProps<T>) {
  useEffect(() => {
    if (items.length === 0) {
      if (selectedId !== null) setSelectedId(null)
      return
    }

    const hasSelected = selectedId && items.some((item) => getId(item) === selectedId)
    if (!hasSelected) {
      setSelectedId(getId(items[0]))
    }
  }, [items, selectedId, setSelectedId, getId])
}
