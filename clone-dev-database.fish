#!/usr/bin/env fish
set -l SERVICE_NAME circle-manager-dev

dokku postgres:unexpose $SERVICE_NAME
dokku postgres:stop $SERVICE_NAME
dokku postgres:destroy $SERVICE_NAME -f
dokku postgres:clone shin-umamusume-db $SERVICE_NAME -p blRFRctblWLp2l4mm3ycSn9TzH8GOMvwAeQhQXilYo
dokku postgres:expose $SERVICE_NAME 0.0.0.0:25432
