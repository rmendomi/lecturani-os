interface WordHighlightProps {
  word: string
  isActive: boolean
  isChildWord: boolean
  isRead: boolean
  isMicActive?: boolean
}

export function WordHighlight({ word, isActive, isChildWord, isRead, isMicActive }: WordHighlightProps) {
  let className = 'inline-block transition-all duration-200 rounded px-0.5 mx-0.5 '

  if (isActive && isChildWord) {
    // Palabra del niño activa: grande, resaltada, llamativa
    className += 'bg-child/25 text-child font-black text-reading-xl underline decoration-2 scale-110 shadow-sm'
  } else if (isActive && isMicActive) {
    // Palabra del adulto activa con micrófono
    className += 'bg-primary text-white font-bold text-reading-lg px-2 py-0.5 rounded-lg scale-105 shadow-sm'
  } else if (isActive) {
    // Palabra activa sin micrófono
    className += 'bg-current/60 text-neutral-800 font-semibold text-reading-md rounded-lg'
  } else if (isChildWord && isRead) {
    // Palabra del niño ya leída
    className += 'text-child/50 font-bold text-reading-lg underline decoration-1'
  } else if (isRead) {
    // Palabra del adulto ya leída
    className += 'text-neutral-400 text-reading-md'
  } else if (isChildWord) {
    // Palabra del niño próxima: más grande y subrayada para que el niño la anticipe
    className += 'text-child font-black text-reading-lg underline decoration-2 underline-offset-2'
  } else {
    // Palabra del adulto próxima
    className += 'text-neutral-700 text-reading-md'
  }

  return <span className={className}>{word} </span>
}
