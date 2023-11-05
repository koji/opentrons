# Use the base image from kojikno/ot-robot-server
FROM kojikno/ot-robot-server:v1.1

# Set the working directory
RUN cd /root/opentrons

# Run app.py
RUN python app.py

# Run make command in robot-server directory
RUN make -C robot-server dev
