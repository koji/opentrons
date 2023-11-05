# Use the base image from kojikno/ot-robot-server
FROM kojikno/ot-robot-server:v1.2

# Set environment variables for pyenv
ENV HOME /root
ENV PYENV_ROOT $HOME/.pyenv
ENV PATH $PYENV_ROOT/shims:$PYENV_ROOT/bin:$PATH

# Initialize pyenv
RUN echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
RUN echo 'export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
RUN echo 'eval "$(pyenv init --path)"' >> ~/.bashrc
RUN echo 'eval "$(pyenv init -)"' >> ~/.bashrc

# Set the working directory
WORKDIR /root/opentrons

# Run make command in robot-server directory
RUN /bin/bash -c "source ~/.bashrc && make -C robot-server dev"

# Run chat UI
RUN /bin/bash -c "source ~/.bashrc && python app.py"


