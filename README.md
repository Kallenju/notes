# Notes

## Getting Started Locally

Ensure Docker is installed, then start the project with:

```bash
npm start
```

## Project Goal

This project is designed to facilitate the creation and management of notes using Markdown. It includes features for editing, searching, archiving, and deleting notes.

The project serves as a practical exercise to deepen DevOps and Backend competencies.

## DevOps Features

In this project I implemented several basic DevOps features:

The project incorporates several fundamental DevOps features:

- Monorepo with Lerna
- Automated CI/CD with GitHub Actions:
  - Project validation on pull requests
  - Automatic tagging and releases
  - Docker image publishing
  - Automatic updates of running Docker containers on AWS EC2
- Integration with AWS Services:
  - IAM
  - Authentication providers
  - EC2
  - S3
  - System Manager
- Docker Compose for Local Development
- Docker Swarm for Production
- Logging
- Build Tools and Linters: compilers (SWC, Rollup), linters, prettifiers, etc.
- Nginx for Development and Production

## Backend Features

- Express
- PostgreSQL Database:
  - Direct SQL queries with pg (no TypeORM)
- Custom Migration Tools:
  - Simple and efficient migration (only one direction) scripts
- Separate Frontend Server:
  - Caches and serves files from S3
