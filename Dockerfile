# Use the base image from kojikno/ot-robot-server
FROM kojikno/ot-robot-server:v1.2

# Update the package lists for upgrades for security purposes
RUN apt-get update

# check python version
RUN python --version

# check node version
RUN node -v

# Set the working directory
WORKDIR /root/opentrons

# Run make command in robot-server directory
RUN make setup-py
RUN make -C robot-server dev

