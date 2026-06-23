# RAG PDF App

### Phase 1
* Simple Front end- React.js based
* Embeddings
* Chunking
* RAG
* Chroma
### Phase 2
* Qdrant
* Metadata filtering
* Hybrid Search (BM25 + Vector)
### Phase 3
* Rerankers
* Multi-vector retrieval
* Agentic RAG
### Phase 4
* PostgreSQL + pgvector
* Milvus


## Ollama
```
I have setup both Ollama Configurations
> If you want you can use Ollama Image from docker- run the script to pull a model and serve it.
> > You can check 
> > > **dockercompose**
> > > **docker folder and bash file** 
> > > ***.env file in backend for Ollama URL*
```

You Can always have NVM (for windows) n(for linux or mac) installed for node version management
[NVM](https://github.com/coreybutler/nvm-windows/releases)


##### To Access front end ==> `http://localhost:3000/`

##### To Access Backend ==> `http://localhost:5000/`

##### To Access redis to check BullMQ Queues data ==> `http://localhost:8081/`


#### Add .env file for backend and add following details
```
PORT = 5000 # backend port
MONGO_URI=mongodb://mongodb:27017/ragpdfapp # mongodb://localhostOrImageName:27017/ragpdfapp you can add username and password as well

REDIS_HOST=redis
REDIS_PORT=6379
PDF_PARSER_URL = http://backend:5000 # backend is the image name hence you can use this way for accessing files. 

OLLAMA_CLOUD_KEY = Your Ollama Key goes here
OLLAMA_URL=http://ollama:11434 # if you are using ollama image and script
# OLLAMA_URL=http://host.docker.internal:11434 # if you want to use your systems ollama

QDRANT_HOST = qdrant
QDRANT_PORT = 6333

QDRANT_SIZE = 768 # dimensions of your embedding model. It should be specific to it.
# QDRANT_BATCH_SIZE = 100
```

##### Please choose OLLAMA configuration wisely or else it will download Ollama image and model which can account to 4gb worth of extra download


#### For front end .env
```
VITE_BACKEND_URL = http://localhost:5000
```