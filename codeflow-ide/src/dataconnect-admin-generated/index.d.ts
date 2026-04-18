import { ConnectorConfig, DataConnect, OperationOptions, ExecuteOperationResponse } from 'firebase-admin/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;


export interface CreateNewProjectData {
  project_insert: Project_Key;
}

export interface CreateNewProjectVariables {
  name: string;
  isTeamProject: boolean;
  description?: string | null;
}

export interface File_Key {
  id: UUIDString;
  __typename?: 'File_Key';
}

export interface GetMyProjectsData {
  projects: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    isTeamProject: boolean;
    createdAt: TimestampString;
    lastModifiedAt?: TimestampString | null;
    owner?: {
      displayName: string;
      email: string;
    };
  } & Project_Key)[];
}

export interface GetTeamDetailsData {
  team?: {
    id: UUIDString;
    name: string;
    description?: string | null;
    createdAt: TimestampString;
    owner: {
      displayName: string;
    };
      teamMemberships_on_team: ({
        role: string;
        user: {
          displayName: string;
          email: string;
        };
      })[];
        projects_on_team: ({
          id: UUIDString;
          name: string;
          isTeamProject: boolean;
        } & Project_Key)[];
  } & Team_Key;
}

export interface GetTeamDetailsVariables {
  teamId: UUIDString;
}

export interface ProjectAccess_Key {
  projectId: UUIDString;
  userId: UUIDString;
  __typename?: 'ProjectAccess_Key';
}

export interface Project_Key {
  id: UUIDString;
  __typename?: 'Project_Key';
}

export interface TeamMembership_Key {
  userId: UUIDString;
  teamId: UUIDString;
  __typename?: 'TeamMembership_Key';
}

export interface Team_Key {
  id: UUIDString;
  __typename?: 'Team_Key';
}

export interface UpdateFileContentData {
  file_update?: File_Key | null;
}

export interface UpdateFileContentVariables {
  fileId: UUIDString;
  newContent: string;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

/** Generated Node Admin SDK operation action function for the 'GetMyProjects' Query. Allow users to execute without passing in DataConnect. */
export function getMyProjects(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<GetMyProjectsData>>;
/** Generated Node Admin SDK operation action function for the 'GetMyProjects' Query. Allow users to pass in custom DataConnect instances. */
export function getMyProjects(options?: OperationOptions): Promise<ExecuteOperationResponse<GetMyProjectsData>>;

/** Generated Node Admin SDK operation action function for the 'CreateNewProject' Mutation. Allow users to execute without passing in DataConnect. */
export function createNewProject(dc: DataConnect, vars: CreateNewProjectVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateNewProjectData>>;
/** Generated Node Admin SDK operation action function for the 'CreateNewProject' Mutation. Allow users to pass in custom DataConnect instances. */
export function createNewProject(vars: CreateNewProjectVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateNewProjectData>>;

/** Generated Node Admin SDK operation action function for the 'GetTeamDetails' Query. Allow users to execute without passing in DataConnect. */
export function getTeamDetails(dc: DataConnect, vars: GetTeamDetailsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetTeamDetailsData>>;
/** Generated Node Admin SDK operation action function for the 'GetTeamDetails' Query. Allow users to pass in custom DataConnect instances. */
export function getTeamDetails(vars: GetTeamDetailsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetTeamDetailsData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateFileContent' Mutation. Allow users to execute without passing in DataConnect. */
export function updateFileContent(dc: DataConnect, vars: UpdateFileContentVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateFileContentData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateFileContent' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateFileContent(vars: UpdateFileContentVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateFileContentData>>;

