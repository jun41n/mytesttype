import { TestContainer } from "@/components/TestContainer";
import { tests } from "@/data/tests";
import { useTranslation } from "react-i18next";

export default function PetMbtiTestPage() {
  const { t } = useTranslation();
  const test = tests.find((test) => test.id === "pet-mbti-test");

  if (!test) {
    return <div>Test not found</div>;
  }

  return (
    <TestContainer
      test={test}
      title={t("tests.pet-mbti-test.title")}
      description={t("tests.pet-mbti-test.description")}
      questions={t("tests.pet-mbti-test.questions", { returnObjects: true })}
      results={t("tests.pet-mbti-test.results", { returnObjects: true })}
    />
  );
}
