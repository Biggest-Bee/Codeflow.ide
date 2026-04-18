import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise } from 'firebase/data-connect';

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

interface GetMyProjectsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyProjectsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetMyProjectsData, undefined>;
  operationName: string;
}
export const getMyProjectsRef: GetMyProjectsRef;

export function getMyProjects(options?: ExecuteQueryOptions): QueryPromise<GetMyProjectsData, undefined>;
export function getMyProjects(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetMyProjectsData, undefined>;

interface CreateNewProjectRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewProjectVariables): MutationRef<CreateNewProjectData, CreateNewProjectVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateNewProjectVariables): MutationRef<CreateNewProjectData, CreateNewProjectVariables>;
  operationName: string;
}
export const createNewProjectRef: CreateNewProjectRef;

export function createNewProject(vars: CreateNewProjectVariables): MutationPromise<CreateNewProjectData, CreateNewProjectVariables>;
export function createNewProject(dc: DataConnect, vars: CreateNewProjectVariables): MutationPromise<CreateNewProjectData, CreateNewProjectVariables>;

interface GetTeamDetailsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetTeamDetailsVariables): QueryRef<GetTeamDetailsData, GetTeamDetailsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetTeamDetailsVariables): QueryRef<GetTeamDetailsData, GetTeamDetailsVariables>;
  operationName: string;
}
export const getTeamDetailsRef: GetTeamDetailsRef;

export function getTeamDetails(vars: GetTeamDetailsVariables, options?: ExecuteQueryOptions): QueryPromise<GetTeamDetailsData, GetTeamDetailsVariables>;
export function getTeamDetails(dc: DataConnect, vars: GetTeamDetailsVariables, options?: ExecuteQueryOptions): QueryPromise<GetTeamDetailsData, GetTeamDetailsVariables>;

interface UpdateFileContentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateFileContentVariables): MutationRef<UpdateFileContentData, UpdateFileContentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateFileContentVariables): MutationRef<UpdateFileContentData, UpdateFileContentVariables>;
  operationName: string;
}
export const updateFileContentRef: UpdateFileContentRef;

export function updateFileContent(vars: UpdateFileContentVariables): MutationPromise<UpdateFileContentData, UpdateFileContentVariables>;
export function updateFileContent(dc: DataConnect, vars: UpdateFileContentVariables): MutationPromise<UpdateFileContentData, UpdateFileContentVariables>;

