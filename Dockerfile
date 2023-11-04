FROM python:3.8.5

RUN apt-get update && \
    apt-get install -y git pkg-config libsystemd-dev

# Set the working directory in the container to /app
WORKDIR /app

# Clone the Opentrons repository
RUN git clone https://github.com/koji/opentrons.git

# Change into the cloned directory
WORKDIR /app/opentrons

# Install dependencies and setup
RUN make setup-py

# Run gradio ui
RUN pip install gradio requests
RUN python app.py

# Run the server
RUN make -C robot-server dev
