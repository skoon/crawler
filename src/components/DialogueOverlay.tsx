import { useGameStore } from '../store'

export function DialogueOverlay() {
  const activeNpcId = useGameStore((s) => s.activeNpcId)
  const currentDialogueNodeId = useGameStore((s) => s.currentDialogueNodeId)
  const npcs = useGameStore((s) => s.npcs)
  const chooseDialogueOption = useGameStore((s) => s.chooseDialogueOption)
  const endDialogue = useGameStore((s) => s.endDialogue)
  const showShop = useGameStore((s) => s.showShop)

  if (!activeNpcId || !currentDialogueNodeId || showShop) return null

  const npc = npcs.find((n) => n.id === activeNpcId)
  if (!npc) return null

  const node = npc.dialogueNodes[currentDialogueNodeId]
  if (!node) return null

  return (
    <div className="dialogue-overlay">
      <div className="dialogue-box">
        <div className="dialogue-header">{npc.name}</div>
        <div className="dialogue-body">{node.text}</div>
        <div className="dialogue-choices">
          {node.choices.map((choice, i) => (
            <button
              key={i}
              className="dialogue-choice-btn"
              onClick={() => chooseDialogueOption(choice)}
            >
              {choice.text}
            </button>
          ))}
          <button className="dialogue-choice-btn dialogue-exit" onClick={endDialogue}>
            Leave Conversation
          </button>
        </div>
      </div>
    </div>
  )
}
