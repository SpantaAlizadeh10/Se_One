export const placementQuestions = [
  {
    level: "A1",
    skill: "grammar",
    prompt: "My sister ___ a student.",
    options: ["am", "is", "are", "be"],
    answer: 1,
  },
  {
    level: "A1",
    skill: "grammar",
    prompt: "They ___ in a small house near the park.",
    options: ["live", "lives", "living", "is live"],
    answer: 0,
  },
  {
    level: "A1",
    skill: "vocabulary",
    prompt: "You use a ___ to open a locked door.",
    options: ["key", "plate", "pillow", "ticket"],
    answer: 0,
  },
  {
    level: "A1",
    skill: "vocabulary",
    prompt: "Which word means the opposite of “expensive”?",
    options: ["crowded", "cheap", "quiet", "late"],
    answer: 1,
  },
  {
    level: "A1",
    skill: "reading",
    prompt:
      "Nina works at a café from Monday to Friday. She does not work on weekends. When does Nina work?",
    options: [
      "Every day",
      "On Saturdays and Sundays",
      "On weekdays",
      "Only on Monday",
    ],
    answer: 2,
  },
  {
    level: "A2",
    skill: "grammar",
    prompt: "We ___ to the museum last Saturday.",
    options: ["go", "went", "have gone", "are going"],
    answer: 1,
  },
  {
    level: "A2",
    skill: "grammar",
    prompt: "There isn't ___ milk left. Could you buy some?",
    options: ["many", "a few", "much", "several"],
    answer: 2,
  },
  {
    level: "A2",
    skill: "vocabulary",
    prompt: "If you miss the bus, you can ___ the next one.",
    options: ["catch", "hold", "save", "carry"],
    answer: 0,
  },
  {
    level: "A2",
    skill: "vocabulary",
    prompt: "A place where you can borrow books is a ___.",
    options: ["bookshop", "library", "museum", "station"],
    answer: 1,
  },
  {
    level: "A2",
    skill: "reading",
    prompt:
      "Leo usually walks to work, but today it is raining, so he is taking a taxi. How is Leo travelling today?",
    options: ["On foot", "By train", "By taxi", "By bicycle"],
    answer: 2,
  },
  {
    level: "B1",
    skill: "grammar",
    prompt: "I ___ in this city since 2021.",
    options: ["live", "lived", "have lived", "am living"],
    answer: 2,
  },
  {
    level: "B1",
    skill: "grammar",
    prompt: "If I ___ more free time, I would learn another language.",
    options: ["have", "had", "will have", "would have"],
    answer: 1,
  },
  {
    level: "B1",
    skill: "vocabulary",
    prompt: "Could you ___ my cat while I'm away this weekend?",
    options: ["look after", "look up", "look into", "look over"],
    answer: 0,
  },
  {
    level: "B1",
    skill: "vocabulary",
    prompt: "The meeting was ___ because the manager was ill.",
    options: ["put off", "taken up", "given in", "made out"],
    answer: 0,
  },
  {
    level: "B1",
    skill: "reading",
    prompt:
      "Maya planned to drive to the coast. After checking the weather forecast, she decided to take the train because heavy snow was expected. Why did she change her plan?",
    options: [
      "Her car had broken down.",
      "The train was cheaper.",
      "The weather could make driving unsafe.",
      "She no longer wanted to visit the coast.",
    ],
    answer: 2,
  },
  {
    level: "B2",
    skill: "grammar",
    prompt: "By the time we arrived, the film ___.",
    options: [
      "already started",
      "has already started",
      "had already started",
      "would already start",
    ],
    answer: 2,
  },
  {
    level: "B2",
    skill: "grammar",
    prompt: "___ the heavy traffic, we arrived at the airport on time.",
    options: ["Although", "Despite", "However", "Because"],
    answer: 1,
  },
  {
    level: "B2",
    skill: "vocabulary",
    prompt: "The new policy will ___ all employees, not just managers.",
    options: ["effect", "affect", "infect", "reflect"],
    answer: 1,
  },
  {
    level: "B2",
    skill: "vocabulary",
    prompt: "The instructions were so ___ that nobody knew what to do.",
    options: ["clear", "straightforward", "ambiguous", "accurate"],
    answer: 2,
  },
  {
    level: "B2",
    skill: "reading",
    prompt:
      "The report found that employees who worked from home were more productive, but noted that the study had excluded workers with limited internet access. What is the main limitation?",
    options: [
      "It measured productivity too frequently.",
      "Its participants may not represent all workers.",
      "It included too many remote workers.",
      "It compared different industries.",
    ],
    answer: 1,
  },
  {
    level: "C1",
    skill: "grammar",
    prompt: "Rarely ___ such a detailed account of the expedition.",
    options: [
      "we have read",
      "have we read",
      "we read",
      "we had been reading",
    ],
    answer: 1,
  },
  {
    level: "C1",
    skill: "grammar",
    prompt:
      "The board recommended that the proposal ___ before any decision was made.",
    options: ["is revised", "be revised", "was revised", "will be revised"],
    answer: 1,
  },
  {
    level: "C1",
    skill: "vocabulary",
    prompt:
      "Her explanation was plausible, but the evidence was too ___ to support a firm conclusion.",
    options: ["conclusive", "circumstantial", "negligible", "inevitable"],
    answer: 1,
  },
  {
    level: "C1",
    skill: "vocabulary",
    prompt:
      "The editor asked the author to ___ the claim, since the cited study did not support it.",
    options: ["substantiate", "undermine", "withdraw", "overlook"],
    answer: 0,
  },
  {
    level: "C1",
    skill: "reading",
    prompt:
      "The article argues that technological progress is often presented as inevitable, a framing that can obscure the policy choices shaping who benefits from it. What is the author's main point?",
    options: [
      "Technology develops independently of society.",
      "Policy choices influence how technological benefits are distributed.",
      "Technological progress should always be slowed.",
      "The benefits of technology are shared equally.",
    ],
    answer: 1,
  },
] as const;

export type PlacementLevel = "A1" | "A2" | "B1" | "B2" | "C1";

const levels: PlacementLevel[] = ["A1", "A2", "B1", "B2", "C1"];
const QUESTIONS_TO_PASS_LEVEL = 3;

export function getPlacementScore(answers: number[]) {
  return answers.reduce(
    (total, answer, index) =>
      total + (answer === placementQuestions[index]?.answer ? 1 : 0),
    0,
  );
}

export function getPlacementLevel(answers: number[]): PlacementLevel {
  let achievedLevel: PlacementLevel = "A1";

  for (const level of levels) {
    const levelQuestionIndexes = placementQuestions.flatMap(
      (question, index) => (question.level === level ? [index] : []),
    );
    const correctAtLevel = levelQuestionIndexes.reduce(
      (total, index) =>
        total + (answers[index] === placementQuestions[index].answer ? 1 : 0),
      0,
    );

    if (correctAtLevel < QUESTIONS_TO_PASS_LEVEL) break;
    achievedLevel = level;
  }

  return achievedLevel;
}

export function getPlacementSkillSummary(answers: number[]) {
  const skills = ["grammar", "vocabulary", "reading"] as const;
  return skills.map((skill) => {
    const indexes = placementQuestions.flatMap(
      (question, index) => (question.skill === skill ? [index] : []),
    );
    const correct = indexes.reduce(
      (total, index) =>
        total + (answers[index] === placementQuestions[index].answer ? 1 : 0),
      0,
    );
    return { skill, correct, total: indexes.length };
  });
}
