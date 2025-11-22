# Use a lightweight python image
FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Copy the files to the working directory
COPY . .

# Expose the port
EXPOSE 8000

# Start the server
CMD ["python", "server.py"]
