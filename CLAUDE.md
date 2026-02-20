# ai-tutorials

## What This Project Does
Collection of AI tutorial code examples. Currently includes a LLaVA (Large Language and Vision Assistant) demo using Ollama's local API for image analysis.

## Key Technologies
- **Python 3** - Core language
- **Ollama** - Local LLM runtime
- **LLaVA** - Vision-language model
- **Requests** - HTTP API calls

## Main Structure
```
LLaVA-ollama-api/
├── llava.py          # Main script for image analysis
├── readme.md         # Tutorial documentation
├── cloudyeti.png     # Sample image
├── hotdog.jpeg       # Sample image
└── pizza.jpeg        # Sample image
```

## How to Run
```bash
# Install Ollama first: https://ollama.ai

# Pull the LLaVA model
ollama pull llava

# Run image analysis
cd LLaVA-ollama-api
python llava.py --image pizza.jpeg --prompt "What is in this image?"
```

## Features
- Local vision-language model inference
- Base64 image encoding
- Custom prompt support
- Auto-starts Ollama server if needed
