import axios from 'axios';
import { IPoint } from 'influx';
import { IBambooBuild, IBambooPlanList, IBambooProject, IBambooMetadata } from '../bamboo.types';
import { logger } from '../../../shared/logger';
import { getQuery } from '../bamboo.send';



//Get All Plans
export async function getPlans(listProjects:IBambooProject[],metadata: IBambooMetadata) {
  logger.info(`Bamboo: Task Getting Builds running`);
  const url:string = `http://${metadata.bambooServer}`
  const authUser:string = metadata.user
  const authPass:string = metadata.key

  const hasProjects = listProjects && listProjects.length > 0;
  const result: IPoint[] = [];

  if(hasProjects){
    for(const field of listProjects){
      
      logger.info(`validate project ${field.name} exist - Bamboo`);
      const urlBambooProject = url.concat(`/rest/api/latest/project/${field.name}`);

      const getProject = await getQuery({auth: { username: authUser, password: authPass }}, urlBambooProject)
      .then((response) => { return response; });
      const statusResponse = getProject.status

      if (!getProject) {
        throw new Error(`Error getting Bamboo Projects with status: ${statusResponse}`);
      }

      const projetData = getProject.data;
      logger.info(`Current project key: ${projetData.key}`);

      const getPlans = await getQuery({auth: { username: authUser, password: authPass }},
        urlBambooProject.concat(`.json?expand=plans`))
      .then((response) => {
          return response;
      });
      
      const planObject = getPlans.data.plans.plan;

      if (planObject){
        for  (let i=0; i < planObject.length; i++){
          let planObjectItem:IBambooPlanList = planObject[i];

          const urlBambooBuildsExists = url.concat(`/rest/api/latest/result/${planObjectItem.key}`);

          const getBuildsExists = await getQuery({auth: { username: authUser, password: authPass }},
            urlBambooBuildsExists)
          .then((response) => { return response.data.results; });

          if (getBuildsExists.size != 0){
            
            const urlBambooBuilds = url.concat(`/rest/api/latest/result/${planObjectItem.key}`).concat(`-latest.json`);
            logger.info(`Getting builds Information ${planObjectItem.key}`);
 
            const getBuilds = await getQuery({auth: { username: authUser, password: authPass }},
            urlBambooBuilds)
            .then((response) => { return response.data; });

            result.push(await map(getBuilds));
            
          }
          else{
              logger.info(`Plan ${planObjectItem.key} without builds`);
          }          
        }
      }
    }
  }
  logger.info(`Bamboo: Task Getting Builds completed`);
  return result;
}

function map(build: IBambooBuild): IPoint {
  const createdDate:Date = new Date(build.buildStartedTime);

  let register:IPoint =  {
    measurement: 'build',
    timestamp: createdDate,
  };

  const ipointTags:any = {
    project: build.plan?.shortName,
    result: build.buildState
  };

  const ipointFields:any = {
    duration: new Date(build.buildCompletedTime).getTime() - new Date(build.buildStartedTime).getTime(),
    success: build.buildState === 'Successful' ? 1 : 0,
  };

  register.tags = { ...ipointTags };
  register.fields = {...ipointFields };
  
  return register;
}