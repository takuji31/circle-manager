#!/usr/bin/env bash

DATABASE_URL='mysql://root:@127.0.0.1:3309/shin-umamusume' yarn ts-node tools/export-db-data.ts
DATABASE_URL='mysql://root:@127.0.0.1:3306/shin-umamusume-dev' yarn ts-node tools/import-db-data.ts
