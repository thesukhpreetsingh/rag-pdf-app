ES LINT. 
Prettier,
Sonarcube

Dockerize it
Loging and observability




7. Pull Model Automatically

Create:

docker/ollama-init.sh

#!/bin/sh

ollama serve &

sleep 10

ollama pull nomic-embed-text

wait

Docker Compose:

ollama:
  image: ollama/ollama
  command: ["/bin/sh", "/ollama-init.sh"]
  volumes:
    - ollama_data:/root/.ollama
    - ./docker/ollama-init.sh:/ollama-init.sh

This ensures the embedding model exists whenever the stack starts.