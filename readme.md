# Learn Passport JS

## Requirements

## Bootstrap
You are encouraged to use `docker-compose up -d` to run mongoDB in a docker-container. There is a *SQL-Migration* included in [mongo](/mongo/init.json) used to seed data. 

Here's sample users

| username | Role       | Password | ReportTo
|:--------|:-----------|:-------------------------------------------------------------------------------| -- |
| admin | admin | `admin` | N/A |
| jeff  | manager | `manager` | N/A |
| david | user | `teamplayer` | jeff |
