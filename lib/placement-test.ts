export const placementQuestions = [
  {
    prompt: "I ___ from Iran.",
    options: ["am", "is", "are", "be"],
    answer: 0,
  },
  {
    prompt: "She ___ coffee every morning.",
    options: ["drink", "drinks", "drinking", "drank"],
    answer: 1,
  },
  {
    prompt: "We ___ to the museum last weekend.",
    options: ["go", "have gone", "went", "will go"],
    answer: 2,
  },
  {
    prompt: "There isn't ___ milk left in the fridge.",
    options: ["many", "a few", "much", "several"],
    answer: 2,
  },
  {
    prompt: "If it ___ tomorrow, we'll stay at home.",
    options: ["rains", "will rain", "rained", "would rain"],
    answer: 0,
  },
  {
    prompt: "I've lived in this city ___ 2021.",
    options: ["for", "since", "during", "from"],
    answer: 1,
  },
  {
    prompt: "The report ___ before the meeting started.",
    options: [
      "has finished",
      "was finishing",
      "had been finished",
      "is finished",
    ],
    answer: 2,
  },
  {
    prompt: "She suggested ___ the earlier train.",
    options: ["take", "to take", "taking", "taken"],
    answer: 2,
  },
  {
    prompt: "Were I ___ about the change, I would have prepared differently.",
    options: ["inform", "informed", "informing", "to inform"],
    answer: 1,
  },
  {
    prompt:
      "The proposal was rejected, not because it lacked merit, ___ because its costs were unclear.",
    options: ["but", "rather", "instead", "although"],
    answer: 0,
  },
] as const;

export function getPlacementLevel(score: number) {
  if (score <= 2) return "A1";
  if (score <= 4) return "A2";
  if (score <= 6) return "B1";
  if (score <= 8) return "B2";
  return "C1";
}

export function getPlacementScore(answers: number[]) {
  return answers.reduce(
    (total, answer, index) =>
      total + (answer === placementQuestions[index]?.answer ? 1 : 0),
    0,
  );
}
