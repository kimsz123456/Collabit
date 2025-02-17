import {
  Contributor,
  Project,
  ProjectInfo,
  ProjectTitle,
} from "../model/Project";

type ProjectInfoResponse = Pick<
  ProjectInfo,
  "code" | "participant" | "done" | "createdAt"
> &
  Pick<Project, "title"> & {
    participationRate: number;
  };

export type Organization = Pick<Project, "organization" | "organizationImage">;

export type ProjectResponse = ProjectInfoResponse & {
  contributors: Contributor[];
};

export type ProjectListResponse = (Organization & {
  projects: ProjectResponse[];
})[];

export type ProjectUpdateCheckResponse = {
  isUpdated: boolean;
};

export type ProjectAddedResponse = ProjectTitle &
  Pick<ProjectInfo, "code"> & {
    isAdded: boolean;
    contributors: Contributor[];
  };
