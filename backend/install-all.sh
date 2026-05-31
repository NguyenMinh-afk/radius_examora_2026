#!/bin/bash
echo "Bắt đầu cài đặt toàn bộ NPM dependencies cho frontend và backend services..."

# Script này nằm trong thư mục `backend`.
# Cài frontend (nằm ở level trên `backend`)
if [ -d "../frontend" ]; then
    echo ">> Cài đặt Frontend (../frontend)..."
    (cd ../frontend && npm install)
else
    echo "Warning: ../frontend không tồn tại. Bỏ qua frontend."
fi

# Cài các service con trong thư mục backend
for dir in */; do
        if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
                SERVICE_NAME=$(basename "$dir")
                echo ">> Cài đặt $SERVICE_NAME..."
                (cd "$dir" && npm install)
        fi
done

echo "TẤT CẢ ĐÃ CÀI ĐẶT THÀNH CÔNG!"