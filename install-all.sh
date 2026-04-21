#!/bin/bash
echo "Bắt đầu cài đặt toàn bộ NPm Dependencies cho Frontend và 6 Backends..."

# 1. Cai frontend
echo ">> Cài đặt Frontend..."
cd frontend
npm install
cd ..

# 2. Cai backend
for dir in backend/*/; do
    if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
        SERVICE_NAME=$(basename "$dir")
        echo ">> Cài đặt $SERVICE_NAME..."
        (cd "$dir" && npm install)
    fi
done

echo "TẤT CẢ ĐÃ CÀI ĐẶT THÀNH CÔNG!"
