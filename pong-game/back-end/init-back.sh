#!/bin/sh

npm install @prisma/client
npx prisma migrate dev --name init
npm run build
npm run start:dev