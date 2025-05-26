# Project Chatbot n8n

This repository contains a backend built with Flask along with supporting
frontend and workflow files. Follow the steps below to get a development
environment running.

## Setup a Python virtual environment

1. Create a new virtual environment in the project root:

   ```bash
   python3 -m venv .venv
   ```

2. Activate the environment:

   ```bash
   source .venv/bin/activate
   ```

3. Install the required dependencies:

   ```bash
   pip install -r backend/requirements.txt
   ```

## Running the backend

With the virtual environment activated and dependencies installed, start the
Flask application using:

```bash
python backend/main.py
```

The server will run in debug mode on port `5001`.

