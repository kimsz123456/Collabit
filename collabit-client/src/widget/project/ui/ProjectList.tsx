"use client";
import { getProjectListAPI } from "@/shared/api/project";
import { ProjectListResponse } from "@/shared/types/response/project";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import SurveyResultModal from "@/widget/project/ui/SurveyResultModal";
import SurveySharingModal from "@/widget/project/ui/SurveySharingModal";
import { useQuery } from "@tanstack/react-query";
import ProjectListSkeleton from "./ProjectListSkeleton";

const ProjectList = ({ keyword, sort }: { keyword: string; sort: string }) => {
  const { data, isLoading } = useQuery<ProjectListResponse>({
    queryKey: ["projectList", keyword, sort],
    queryFn: () => getProjectListAPI({ keyword, sort }),
  });

  const projectList: ProjectListResponse = Array.isArray(data) ? data : [];

  if (isLoading) {
    return <ProjectListSkeleton />;
  }

  if (projectList.length === 0) {
    return (
      <div className="m-10 flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-gray-200 p-8">
        <div className="mb-2 text-4xl">✨</div>
        <h3 className="text-xl font-semibold text-gray-800">
          아직 등록된 프로젝트가 없어요
        </h3>
        <p className="text-center text-gray-600">
          프로젝트를 등록하고 협업했던 동료들에게
          <br />
          소중한 피드백을 요청해보세요!
        </p>
      </div>
    );
  }

  return (
    <Accordion
      type="multiple"
      defaultValue={projectList.map((org) => org.organization)}
    >
      {projectList.map((org) => (
        <AccordionItem key={org.organization} value={org.organization}>
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={org.organizationImage} />
                <AvatarFallback>{org.organization.slice(0, 2)}</AvatarFallback>
              </Avatar>
              {org.organization}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {org.projects.map((project) =>
                project.done ? (
                  <SurveyResultModal
                    key={`${org.organization}-${project.code}`}
                    project={project}
                    organization={org.organization}
                  />
                ) : (
                  <SurveySharingModal
                    key={`${org.organization}-${project.code}`}
                    project={project}
                    organization={org.organization}
                  />
                ),
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default ProjectList;
