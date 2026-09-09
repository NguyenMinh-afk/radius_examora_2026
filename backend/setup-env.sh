#!/bin/bash
set -e
echo "Starting .env configuration..."

# Resolve script directory so it can be run from anywhere
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR"

declare -a SERVICES=(
    "User_Service|5000"
    "Exam_Service|3001"
    "Question_Service|3002"
    "AI_Generation_Service|3003"
    "Notification_Service|3004"
    "API_Gateway_Service|3000"
)

for ITEM in "${SERVICES[@]}"; do
    SERVICE="${ITEM%%|*}"
    PORT="${ITEM##*|}"
    SERVICE_DIR="$BACKEND_DIR/$SERVICE"

    if [ -f "$SERVICE_DIR/.env.example" ]; then
        echo "Configuring $SERVICE_DIR/.env with port $PORT"
        cp "$SERVICE_DIR/.env.example" "$SERVICE_DIR/.env"

        # Update common hosts to docker-compose service names
        sed -i.bak 's/DB_HOST=localhost/DB_HOST=postgres-db/g' "$SERVICE_DIR/.env" || true
        sed -i.bak 's/RABBITMQ_HOST=localhost/RABBITMQ_HOST=rabbitmq/g' "$SERVICE_DIR/.env" || true

        # Update PORT (replace any existing PORT=... value)
        sed -i.bak "s/^PORT=.*/PORT=$PORT/" "$SERVICE_DIR/.env" || true

        # Set DB_NAME to Exam_Bank for consistency
        sed -i.bak 's/^DB_NAME=.*/DB_NAME=Exam_Bank/' "$SERVICE_DIR/.env" || true

        # Remove backup
        rm -f "$SERVICE_DIR/.env.bak"
    else
        echo "Warning: $SERVICE_DIR/.env.example not found!"
    fi
done

echo "Tạo .env thành công!"