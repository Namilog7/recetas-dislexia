#!/bin/bash
trap 'kill %1' SIGINT
echo "Iniciando backend..."
source backend/.venv/bin/activate
cd backend 
uvicorn app.main:app --reload &
echo "Iniciando frontend..."
cd ../frontend 
npm run dev 