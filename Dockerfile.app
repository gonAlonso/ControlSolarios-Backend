FROM node:12.0

# Create app directory
WORKDIR /opt/node
#WORKDIR D:\Proxectos\Proxectos\Gestion Solarios\BackendGestionSolarios

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
#COPY package*.json ./
RUN npm install -g nodemon 

#RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
#COPY . .
#COPY mongo_setup.sh .

EXPOSE 5300

# CMD [ "node", "server.js" ]

# Periodically check if the application is running. If not, shutdown the
# container.
#HEALTHCHECK --interval=2m --timeout=5s --start-period=2m \
#  CMD nc -z -w5 127.0.0.1 5300 || exit 1

# Wait 5 seconds for the MongoDB connection
CMD npm install
# CMD ./mongo_setup.sh

CMD echo "BACKEND up" && sleep 5 && npm start
