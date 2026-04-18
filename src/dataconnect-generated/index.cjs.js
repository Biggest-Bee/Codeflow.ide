const { queryRef, executeQuery, validateArgsWithOptions, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'codeflowide',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

const getMyProjectsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMyProjects');
}
getMyProjectsRef.operationName = 'GetMyProjects';
exports.getMyProjectsRef = getMyProjectsRef;

exports.getMyProjects = function getMyProjects(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(getMyProjectsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const createNewProjectRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewProject', inputVars);
}
createNewProjectRef.operationName = 'CreateNewProject';
exports.createNewProjectRef = createNewProjectRef;

exports.createNewProject = function createNewProject(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createNewProjectRef(dcInstance, inputVars));
}
;

const getTeamDetailsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetTeamDetails', inputVars);
}
getTeamDetailsRef.operationName = 'GetTeamDetails';
exports.getTeamDetailsRef = getTeamDetailsRef;

exports.getTeamDetails = function getTeamDetails(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getTeamDetailsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const updateFileContentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateFileContent', inputVars);
}
updateFileContentRef.operationName = 'UpdateFileContent';
exports.updateFileContentRef = updateFileContentRef;

exports.updateFileContent = function updateFileContent(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateFileContentRef(dcInstance, inputVars));
}
;
