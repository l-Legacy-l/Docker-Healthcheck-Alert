import axios, { AxiosRequestConfig } from 'axios';
import { Container, ContainerDetails, HEALTH_STATUS } from './model/DockerResponse';
const nodemailer = require('nodemailer');


const config: AxiosRequestConfig = {
  socketPath: '/var/run/docker.sock'
}
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_FROM,
    pass: process.env.PASSWORD
  }
});

const mailOptions = {
  from: process.env.MAIL_FROM,
  to: process.env.MAIL_TO,
  subject: 'Docker Heathcheck Alert - Unhealthy container reported',
  text: ''
};


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
    if(Health?.Status) {
      if (Health.Status !== HEALTH_STATUS.healthy &&
        !unHealthyContainers.find((unHealthyContainer) => unHealthyContainer === Id)) {
  
        unHealthyContainers.push(Id);
        sendAlert(Id);
  
      } else if (Health.Status === HEALTH_STATUS.healthy &&
        unHealthyContainers.find((unHealthyContainer) => unHealthyContainer === Id)) {
  
        unHealthyContainers.filter((unHealthyContainer) => unHealthyContainer !== Id);
      }
    }

  }
}

function sendAlert(Id: string) {
  mailOptions.text= 'Unhealthy container: ' + Id;
  transporter.sendMail(mailOptions, (error: string, info: {response: string}) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

main();