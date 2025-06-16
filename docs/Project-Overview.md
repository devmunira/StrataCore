# Project Documentation

## Project Overview

This project is a backend framework designed to simplify and automate common development tasks such as database handling, logging, routing, caching, and task queuing. It supports modern TypeScript practices including decorators, abstract classes, SOLID principles and design patterns to deliver a scalable and developer-friendly architecture.

---

## Problems Solved So Far

- ✅ Implemented a **dynamic database driver system** that supports both **MySQL** and **PostgreSQL**.
- ✅ Built a **strategy-based logger system** that supports multiple logging backends (**console** and **file system**).
- ✅ **Logger system** includes support for **log rotation** and **archival via gzip compression**.

---

## Feature: Dynamic Database Driver System

The system dynamically chooses the database driver (**PostgreSQL** or **MySQL**) at runtime based on configuration. It uses a **common pool interface** to abstract over driver-specific connection pools. This allows the application to initialize a database connection using the appropriate client while maintaining **reusable and scalable code**.

---

## Feature: Custom Logger System

The logger system is implemented using the **Strategy Design Pattern**. Developers can plug in multiple logger strategies (**ConsoleLogger**, **FileLogger**, etc.). Each logger strategy implements a common interface and supports methods such as `.info()`, `.warn()`, `.debug()` and `.error()`.

- **FileLogger** supports:
  - Log rotation after a specific number of lines
  - Compression of old logs using **gzip**
  - Cleanup of logs older than a specified retention period

---

> More features will be documented as they are developed.
