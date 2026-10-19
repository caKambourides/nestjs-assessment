#!/bin/bash
set -e

PORT=3000 \
JWT_SECRET="change-me" \
DATABASE_PATH="data/app.sqlite" \
npm run start:dev
