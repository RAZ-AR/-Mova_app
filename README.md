# Mova

This is a simple project that displays a dynamic background with pastel tones.

## How to run

To run the project, you have three options:

1.  Open the `index.html` file in your browser.
2.  Run the python server and open `localhost:8000` in your browser.
3.  Run the docker container and open `localhost:8000` in your browser.

### Run the python server

To run the server you need to have python installed.
Then you can run the following command in your terminal:
```bash
python server.py
```

### Run the docker container

To run the docker container you need to have docker installed.
Then you can run the following commands in your terminal:

Build the docker image:
```bash
docker build -t mova .
```

Run the docker container:
```bash
docker run -p 8000:8000 mova
```