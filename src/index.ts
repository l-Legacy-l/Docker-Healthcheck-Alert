// import { Container } from './model/DockerResponse';
// const http = require('http');

import axios, { AxiosRequestConfig } from 'axios';
import { Container, ContainerDetails, HEALTH_STATUS } from './model/DockerResponse';


const config: AxiosRequestConfig = {
  socketPath: '/var/run/docker.sock'
}

let unHealthyContainers: string[] = [];

const dockerAxios = axios.create(config);

async function request(path: string) {
  try {
    const response = await dockerAxios.get(path);
    if (response?.status >= 200 && response?.status < 300) {
      return response.data;
    }
    throw new Error('Error: ' + response.status);

  } catch (error) {
    throw new Error('Error: ' + error);
  }
}

async function main() {
  const containers: Container[] = await request('/containers/json');

  for (const container of containers) {
    const {Id, Health}: ContainerDetails = await request('/containers/' + container.Id + '/json');

    if (Health?.Status !== HEALTH_STATUS.healthy &&
      !unHealthyContainers.find((unHealthyContainer) => unHealthyContainer === Id)) {

      unHealthyContainers.push(Id);
    } else if (Health?.Status === HEALTH_STATUS.healthy &&
      unHealthyContainers.find((unHealthyContainer) => unHealthyContainer === Id)) {

      unHealthyContainers.filter((unHealthyContainer) => unHealthyContainer !== Id);
    }

  }
}

main();