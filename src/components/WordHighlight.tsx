interface WordHighlightProps {
  word: string
  isActive: boolean
  isChildWord: boolean
  isRead: boolean
  isMicActive?: boolean
}

export function WordHighlight({ word, isActive, isChildWord, isRead, isMicActive }: WordHighlightProps) {
  // Tamaño y peso fijos por tipo — nunca cambian al activarse (evita reflow)
  const baseClass = isChildWord
    ? 'text-reading-lg font-black'
    : 'text-reading-md font-normal'

  let stateClass: string
  if (isActive && isChildWord) {
    stateClass = 'bg-child/25 text-child rounded'
  } else if (isActive && isMicActive) {
    stateClass = 'bg-primary text-white rounded'
  } else if (isActive) {
    stateClass = 'bg-neutral-200 text-neutral-900 rounded'
  } else if (isChildWord && isRead) {
    stateClass = 'text-child/50 underline decoration-1'
  } else if (isRead) {
    stateClass = 'text-neutral-400'
  } else if (isChildWord) {
    stateClass = 'text-child underline decoration-2 underline-offset-2'
  } else {
    stateClass = 'text-neutral-700'
  }

  return (
    <span className={`inline-block px-0.5 mx-0.5 transition-colors duration-150 ${baseClass} ${stateClass}`}>
      {word}{' '}
    </span>
  )
}
