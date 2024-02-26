#!/bin/sh
# ????docker-composeĿ¼
npm run build:docker

# ????docker-composeĿ¼
docker run -p 3000:3000 --env-file .env blockscout-frontend:local -d

echo "frentend start"