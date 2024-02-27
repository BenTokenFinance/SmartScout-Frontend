#!/bin/sh

git pull origin sbch

# ????docker-composeĿ¼
docker build --build-arg GIT_COMMIT_SHA=$(git rev-parse --short HEAD) --build-arg GIT_TAG=$(git describe --tags --abbrev=0) -t blockscout-frontend:local ./

# ????docker-composeĿ¼
docker run -p 3000:3000 --env-file .env -d  blockscout-frontend:local

echo "frentend start"