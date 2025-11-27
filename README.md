# Task Queue Platform

A small distributed system showcasing:

- **TypeScript / Node.js** REST API
- **Kafka** as a message queue
- **Redis** as a cache for task statuses/results
- **Docker & Docker Compose** for containerization
- **GitHub Actions** for CI/CD (test, build, Docker publish)
- **Ansible** for deploying containers to a remote VM
- **Gitflow** branching model and **Conventional Commits**

This project is designed as a portfolio piece to demonstrate skills in **backend engineering**, **DevOps / SRE / Platform**, and working with **queues and cache layers**.

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Clone & Install](#clone--install)
  - [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
  - [Option 1: Native (without Docker)](#option-1-native-without-docker)
  - [Option 2: Docker Compose](#option-2-docker-compose)
- [API Reference](#api-reference)
  - [Health Check](#health-check)
  - [Create Task](#create-task)
  - [Get Task Status/Result](#get-task-statusresult)
- [Testing](#testing)
- [CI/CD with GitHub Actions](#cicd-with-github-actions)
- [Deployment with Ansible](#deployment-with-ansible)
- [Gitflow & Commit Conventions](#gitflow--commit-conventions)
- [Roadmap / Ideas to Extend](#roadmap--ideas-to-extend)
- [License](#license)

---

## Architecture

**High-level flow:**

1. Client sends a **task** to the REST API (`POST /tasks`).
2. API:
   - Generates a `taskId`.
   - Publishes a message to a **Kafka** topic (`tasks`).
   - Saves initial task state (**PENDING**) in **Redis** cache.
3. A **Kafka consumer worker** reads messages from the `tasks` topic:
   - Marks the task as **PROCESSING** in Redis.
   - Performs some processing (demo: transform data or uppercase a string).
   - Stores the result with status **DONE** (or **FAILED** on error) in Redis.
4. Client can call `GET /tasks/:id` to check task status/result:
   - The API reads from **Redis** (cache-first).

**Why this is a good portfolio project:**

- Shows you understand **asynchronous processing**, **queues**, and **event-driven architecture**.
- Demonstrates use of **cache layer** (Redis) to speed up responses.
- Includes **DevOps practices**: Docker, GitHub Actions, Ansible.
- Follows **Gitflow** and **Conventional Commits** for collaboration discipline.

---

## Tech Stack

- **Language:** TypeScript (Node.js)
- **Web Framework:** Express
- **Message Queue:** Kafka (via `kafkajs`)
- **Cache:** Redis (via `ioredis`)
- **Containerization:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Infrastructure as Code / Deployment:** Ansible
- **Testing:** Jest + Supertest

---

## Features

- Create tasks via REST API.
- Process tasks asynchronously via Kafka consumer.
- Cache task statuses and results in Redis.
- Health check endpoint for SRE-style monitoring.
- Docker images ready for local development and production.
- GitHub Actions pipeline:
  - Test and build on every push / PR.
  - Build and push Docker image to GitHub Container Registry on `main`.
- Ansible playbook for deploying the container to a remote VM (e.g., free-tier).

---

## Getting Started

### Prerequisites

- **Node.js** v18+ (recommended Node 20)
- **npm**
- **Docker** and **Docker Compose** (for container-based setup)
- Access to **Kafka** and **Redis**
  - For local development you can run them with Docker.
- (Optional) A remote **Ubuntu VM** if you want to try the Ansible deployment.

### Clone & Install

```bash
git clone https://github.com/jaafar-harabi/task-queue-platform.git
cd task-queue-platform

npm install
