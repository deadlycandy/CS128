FROM node:8

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package.json /usr/src/app/

RUN npm install --production
# If you are building your code for production
# RUN npm install --only=production
RUN npm install pm2 -g

# Copies files into app directory 
ADD . /usr/src/app/

# setting the defaults for env variables
#ENV IP=${IP}
ENV PORT=${PORT}
ENV MAINIP=${MAINIP}

# Manually adding env variables
#RUN touch local.env
#RUN echo "ip=${IP}" >> local.env
#RUN echo "port=${PORT}" >> local.env
#RUN echo "mainIp=${MAINIP}" >> local.env

# starts the node server 
CMD [ "pm2-runtime", "start", "server.js" ]

EXPOSE 8080

