# Running the App with Docker
## Prerequisites
- Docker: Ensure Docker is installed on your system. You can download and install Docker from [Docker's official website](https://www.docker.com/get-started/).
- Docker Compose: Docker Compose is included in Docker Desktop for Windows and macOS. For Linux, you may need to install it separately.

## Running the application

**Building the Docker Image:**

Navigate to the root directory of the **sitevisor** project and then build the Docker image:

```bash
docker-compose build
```

**Starting the Application:**

After the build completes, you can start the application using Docker Compose:

```bash
docker-compose up -d
```

**Accessing the Application**

Once the container is running, access the app by navigating to http://localhost:8080 in a web browser.

**Stopping the Application**

To stop the application, you can use the following command:

```bash
docker-compose down
```