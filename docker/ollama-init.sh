#!/bin/sh

ollama serve &

sleep 10

ollama pull embeddinggemma:300m

wait