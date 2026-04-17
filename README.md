# Project_EXAMORA - Setup & Run Guide

This project uses a microservice architecture with multiple backend services and a separate frontend. Follow the instructions below to set up and run the project locally.

---

## 1. Prerequisites
- **Node.js** (v16 or higher recommended)
- **npm** (comes with Node.js)
- **PostgreSQL** or your chosen database (see `database/README.md`)
- **RabbitMQ** (if using message queues)
- **(Optional) Docker & Docker Compose** for easier multi-service management

---

## 2. Clone the Repository
```bash
git clone <your-repo-url>
cd Project_Exmora
```

---

## 3. Database Setup
- See `database/README.md` for schema and seeding instructions.
- Create databases for each service if you want full microservice isolation.
- Update each service's `.env` file with the correct DB connection info.

---

## 4. Backend Services
Each service is located in `backend/<Service_Name>/` (e.g., `User_Service`, `Exam_Service`, ...).

### To run a service:
```bash
cd backend/<Service_Name>
npm install
cp .env.example .env   # Edit .env as needed
npm run dev
```
- Repeat for each service you want to run.

---

## 5. Frontend
```bash
cd frontend
npm install
npm run dev
```
- The frontend will typically run at [http://localhost:5173](http://localhost:5173) (or as shown in the terminal).

---

## 6. Using Docker Compose (Recommended for local dev)
- Create a `docker-compose.yml` at the project root to orchestrate all services, database, and RabbitMQ.
- Example services to include: all backend services, frontend, database, RabbitMQ.

---

## 7. Environment Variables
- Each service has its own `.env` file. Copy from `.env.example` and update values as needed.
- Common variables: DB connection, JWT secret, RabbitMQ URL, etc.

---

## 8. Useful Scripts
- Database migration/seeding: see `database/` folder.
- Queue setup: see each service's `queue/` folder if available.

---

## 9. Troubleshooting
- Ensure all services are running and can connect to their databases.
- Check `.env` files for correct configuration.
- Use logs in each service for debugging.

---

## 10. Contribution
- Fork, branch, and submit pull requests as usual.
- Please document any new service or major change in this README.

---

## 11. Contact
For questions or support, please contact the project maintainer.
