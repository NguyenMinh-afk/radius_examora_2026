#!/bin/bash
echo "Starting .env configuration..."

BACKEND_DIR="backend"

declare -a SERVICES=(
    "User_Service|3001"
    "Exam_Service|3002"
    "Question_Service|3003"
    "AI_Generation_Service|3004"
    "Analytics_Service|3005"
    "Notification_Service|3006"
)

for ITEM in "${SERVICES[@]}"; do
    SERVICE="${ITEM%%|*}"
    PORT="${ITEM##*|}"
    SERVICE_DIR="$BACKEND_DIR/$SERVICE"

    if [ -f "$SERVICE_DIR/.env.example" ]; then
        echo "Configuring $SERVICE_DIR/.env with port $PORT"
        cp "$SERVICE_DIR/.env.example" "$SERVICE_DIR/.env"
        
        # Sửa DB_HOST và RABBITMQ_HOST
        sed -i '' 's/DB_HOST=localhost/DB_HOST=postgres-db/g' "$SERVICE_DIR/.env"
        sed -i '' 's/RABBITMQ_HOST=localhost/RABBITMQ_HOST=rabbitmq/g' "$SERVICE_DIR/.env"
        
        # Cập nhật PORT
        sed -i '' "s/PORT=3000/PORT=$PORT/g" "$SERVICE_DIR/.env"
        
    else
        echo "Warning: $SERVICE_DIR/.env.example not found!"
    fi
done

echo "Tạo .env thành công!"
