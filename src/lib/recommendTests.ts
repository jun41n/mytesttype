export type TestCategory =
  | "mbti"
  | "love"
  | "tarot"
  | "personality"
  | "fun"
  | "fortune";

export interface TestItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: TestCategory;
  popularity: number; // 높을수록 인기
  isActive?: boolean;
}

export const TEST_CATALOG: TestItem[] = [
  {
    id: "mbti-basic",
    slug: "/tests/mbti",
    title: "MBTI Test",
    description: "Find your personality type and traits.",
    category: "mbti",
    popularity: 100,
    isActive: true,
  },
  {
    id: "love-style",
    slug: "/tests/love-style",
    title: "Love Style Test",
    description: "Discover your relationship style.",
    category: "love",
    popularity: 95,
    isActive: true,
  },
  {
    id: "tarot-3cards",
    slug: "/tests/tarot-3cards",
    title: "3-Card Tarot Reading",
    description: "Reveal your past, present, and future.",
    category: "tarot",
    popularity: 92,
    isActive: true,
  },
  {
    id: "soulmate-test",
    slug: "/tests/soulmate",
    title: "Soulmate Test",
    description: "Check your ideal relationship match.",
    category: "love",
    popularity: 88,
    isActive: true,
  },
  {
    id: "color-personality",
    slug: "/tests/color-personality",
    title: "Color Personality Test",
    description: "See what your favorite color says about you.",
    category: "personality",
    popularity: 84,
    isActive: true,
  },
  {
    id: "pet-personality-test",
    slug: "/tests/pet-personality-test",
    title: "Pet Personality Test",
    description: "Analyze your pet's dog or cat personality through everyday behavior.",
    category: "personality",
    popularity: 82,
    isActive: true,
  },
  {
    id: "yes-no-tarot",
    slug: "/tests/tarot-yes-no",
    title: "Yes or No Tarot",
    description: "Get a quick tarot answer to your question.",
    category: "tarot",
    popularity: 83,
    isActive: true,
  },
  {
    id: "iq-style",
    slug: "/tests/iq-style",
    title: "Thinking Style Test",
    description: "Check how your brain prefers to solve problems.",
    category: "fun",
    popularity: 78,
    isActive: true,
  },
  {
    id: "destiny-test",
    slug: "/tests/destiny",
    title: "Destiny Test",
    description: "Explore your life tendency and hidden path.",
    category: "fortune",
    popularity: 75,
    isActive: true,
  },
];

function shuffleArray<T>(items: T[]): T[] {
  const copied = [...items];
  for (let i = copied.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }
  return copied;
}

function uniqueById(items: TestItem[]): TestItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export interface RecommendParams {
  currentTestId: string;
  currentCategory?: TestCategory;
  limit?: number;
}

export function getRecommendedTests({
  currentTestId,
  currentCategory,
  limit = 4,
}: RecommendParams): TestItem[] {
  const activeTests = TEST_CATALOG.filter(
    (test) => test.isActive !== false && test.id !== currentTestId
  );

  const sameCategory = activeTests
    .filter((test) => currentCategory && test.category === currentCategory)
    .sort((a, b) => b.popularity - a.popularity);

  const popular = activeTests
    .filter((test) => !currentCategory || test.category !== currentCategory)
    .sort((a, b) => b.popularity - a.popularity);

  const randomPool = shuffleArray(
    activeTests.filter(
      (test) =>
        test.id !== currentTestId &&
        !sameCategory.some((s) => s.id === test.id) &&
        !popular.some((p) => p.id === test.id)
    )
  );

  const combined = uniqueById([
    ...sameCategory.slice(0, 2),
    ...popular.slice(0, 2),
    ...randomPool,
  ]);

  return combined.slice(0, limit);
}
