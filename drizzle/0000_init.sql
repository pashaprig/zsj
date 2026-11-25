-- Enable pgvector: embeddings for semantic search are stored as vector columns (ADR-0002).
CREATE EXTENSION IF NOT EXISTS vector;
