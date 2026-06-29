import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const artifactPath = path.join(root, "content/artifacts/rule-vs-learning.html");
const containerPath = path.join(root, "content/containers/ai-literacy-starter/container.json");

const bodyMarkdown = `## 과일 하나를 분류해 봅시다

사과를 사과라고 판단하는 프로그램을 만든다고 생각해 보세요.

가장 직관적인 방법은 **규칙을 적는 겁니다.** "빨간색이면 사과." 간단하죠. 전통적인 프로그램이 이렇게 동작합니다. 사람이 조건을 적으면, 컴퓨터는 그 조건을 있는 그대로 따릅니다.

문제는 세상이 그렇게 깔끔하지 않다는 거예요. 초록 사과는요? 작고 빨간 체리는? 조건을 하나 추가할 때마다 또 다른 예외가 생기고, 규칙은 끝없이 늘어납니다.

## 규칙 대신 예시를 보여주면

머신러닝은 다른 방식을 씁니다. 규칙을 사람이 일일이 적는 대신 **"이건 사과" "이건 포도"라고 이름표를 붙인 예시를 잔뜩 보여줍니다.** 그러면 모델이 예시들 사이에서 패턴을 찾아냅니다.

새 과일이 들어오면? 기존 예시 중 **가장 비슷한 것**을 찾아서 판단합니다. 규칙이 아니라 데이터가 판단의 근거가 되는 셈이죠.

## 핵심 차이 한 줄

규칙 프로그램은 **사람이 쓴 조건**을 따르고, 학습 모델은 **데이터에서 찾은 패턴**을 따릅니다. AI가 마법이 아니라 계산인 이유가 여기 있습니다.`;

const paragraphs = [
  "사과를 사과라고 판단하는 프로그램을 만든다고 생각해 보세요.",
  "가장 직관적인 방법은 규칙을 적는 겁니다. 사람이 조건을 적으면 컴퓨터는 그대로 따릅니다. 문제는 세상이 그렇게 깔끔하지 않다는 점입니다.",
  "머신러닝은 규칙 대신 예시를 보여줍니다. 새 과일이 들어오면 기존 예시 중 가장 비슷한 것을 찾아서 판단합니다.",
  "규칙 프로그램은 사람이 쓴 조건을 따르고, 학습 모델은 데이터에서 찾은 패턴을 따릅니다."
];

const checkpoints = [
  "규칙 프로그램이 예외에 부딪힐 때 왜 한계가 생기는지 설명할 수 있습니다.",
  "학습 모델이 예시를 기반으로 판단하는 방식이 규칙과 어떻게 다른지 말할 수 있습니다."
];

function findRuleVsLearningPage(container) {
  for (const mod of container.modules ?? []) {
    for (const lesson of mod.lessons ?? []) {
      for (const page of lesson.pages ?? []) {
        if (page.id === "rule-vs-learning") return page;
      }
    }
  }
  return null;
}

const artifactHtml = fs.readFileSync(artifactPath, "utf8");
const container = JSON.parse(fs.readFileSync(containerPath, "utf8"));
const page = findRuleVsLearningPage(container);

if (!page) {
  console.error("rule-vs-learning page not found");
  process.exit(1);
}

page.left.bodyMarkdown = bodyMarkdown;
page.left.paragraphs = paragraphs;
page.left.checkpoints = checkpoints;

const block = page.workspace?.blocks?.find((b) => b.type === "code-canvas");
if (!block) {
  console.error("code-canvas block not found");
  process.exit(1);
}

block.props.prompt =
  "과일 분류 인터랙션: 3가지 과일을 규칙/학습 방식으로 비교. artifact-base.css 사용.";
block.props.code = artifactHtml;
block.props.entry = "index.html";
block.props.files = { "index.html": artifactHtml };
block.props.status = "verified";
block.props.version = (block.props.version ?? 1) + 1;

fs.writeFileSync(containerPath, `${JSON.stringify(container, null, 2)}\n`, "utf8");
console.log("Synced rule-vs-learning page to container.json");
