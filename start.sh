#!/bin/bash

# Start the frontend (which serves the Next.js app)
cd frontend
npm install
npm run build
npm start
