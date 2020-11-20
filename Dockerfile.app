FROM node:12.0

WORKDIR /opt/node
COPY package*.json ./
#RUN npm install
#RUN npm install -g nodemon express
EXPOSE 5300
CMD npm install --silent
CMD npm install -g nodemon
CMD echo "BACKEND up" && sleep 5 && npm start
