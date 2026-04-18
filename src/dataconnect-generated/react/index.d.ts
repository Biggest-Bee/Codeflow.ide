import { GetMyProjectsData, CreateNewProjectData, CreateNewProjectVariables, GetTeamDetailsData, GetTeamDetailsVariables, UpdateFileContentData, UpdateFileContentVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useGetMyProjects(options?: useDataConnectQueryOptions<GetMyProjectsData>): UseDataConnectQueryResult<GetMyProjectsData, undefined>;
export function useGetMyProjects(dc: DataConnect, options?: useDataConnectQueryOptions<GetMyProjectsData>): UseDataConnectQueryResult<GetMyProjectsData, undefined>;

export function useCreateNewProject(options?: useDataConnectMutationOptions<CreateNewProjectData, FirebaseError, CreateNewProjectVariables>): UseDataConnectMutationResult<CreateNewProjectData, CreateNewProjectVariables>;
export function useCreateNewProject(dc: DataConnect, options?: useDataConnectMutationOptions<CreateNewProjectData, FirebaseError, CreateNewProjectVariables>): UseDataConnectMutationResult<CreateNewProjectData, CreateNewProjectVariables>;

export function useGetTeamDetails(vars: GetTeamDetailsVariables, options?: useDataConnectQueryOptions<GetTeamDetailsData>): UseDataConnectQueryResult<GetTeamDetailsData, GetTeamDetailsVariables>;
export function useGetTeamDetails(dc: DataConnect, vars: GetTeamDetailsVariables, options?: useDataConnectQueryOptions<GetTeamDetailsData>): UseDataConnectQueryResult<GetTeamDetailsData, GetTeamDetailsVariables>;

export function useUpdateFileContent(options?: useDataConnectMutationOptions<UpdateFileContentData, FirebaseError, UpdateFileContentVariables>): UseDataConnectMutationResult<UpdateFileContentData, UpdateFileContentVariables>;
export function useUpdateFileContent(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateFileContentData, FirebaseError, UpdateFileContentVariables>): UseDataConnectMutationResult<UpdateFileContentData, UpdateFileContentVariables>;
