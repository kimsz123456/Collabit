import SurveyRoom from "@/features/survey/ui/SurveyRoom";

const SurveyPage = async ({
  params,
}: {
  params: Promise<{ projectId: number }>;
}) => {
  const { projectId } = await params;
  return <SurveyRoom id={projectId} />;
};

export default SurveyPage;
