interface WordHighlightProps {
  word: string
  isActive: boolean
  isChildWord: boolean
  isRead: boolean
}

export function WordHighlight({ word, isActive, isChildWord, isRead }: WordHighlightProps) {
  let className = 'inline transition-all duration-200 rounded px-0.5 '

  if (isActive && isChildWord) {
    className += 'bg-child/20 text-child font-bold text-reading-xl scale-110 inline-block'
  } else if (isActive) {
    className += 'bg-current/60 text-neutral-800 font-semibold inline-block'
  } else if (isChildWord && isRead) {
    className += 'text-child/60'
  } else if (isRead) {
    className += 'text-neutral-400'
  } else if (isChildWord) {
    className += 'text-child font-semibold'
  } else {
    className += 'text-neutral-700'
  }

  return <span className={className}>{word} </span>
}
