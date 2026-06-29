export const workspaceBlockRegistry = {
  "code-canvas": {
    description: "우측 페이지에 실행 가능한 HTML/CSS/JS 산출물을 표시합니다.",
    implemented: true
  },
  "intro-summary": {
    description: "완료 산출물을 요약합니다.",
    implemented: true
  },
  "image-definition": {
    description: "이미지 위에 핵심 정의나 설명을 표시합니다.",
    implemented: true
  },
  "block-board": {
    description: "업무 블럭을 선택해 상태에 저장합니다.",
    implemented: true
  },
  "state-summary": {
    description: "이전 블록에서 저장한 상태를 요약합니다.",
    implemented: true
  },
  "example-list": {
    description: "예시 그룹과 항목 목록을 표시합니다.",
    implemented: true
  },
  "candidate-select": {
    description: "상태 목록에서 최종 후보를 선택합니다.",
    implemented: true
  },
  quiz: {
    description: "객관식 또는 다중 선택 질문을 표시합니다.",
    implemented: true
  },
  checklist: {
    description: "체크리스트 항목을 표시합니다.",
    implemented: true
  },
  "result-card": {
    description: "학습자가 만든 산출물을 카드 형태로 정리합니다.",
    implemented: true
  }
} as const;

export type WorkspaceBlockType = keyof typeof workspaceBlockRegistry;

export const workspaceBlockTypes = Object.keys(workspaceBlockRegistry) as WorkspaceBlockType[];

export function isWorkspaceBlockType(value: string): value is WorkspaceBlockType {
  return value in workspaceBlockRegistry;
}
