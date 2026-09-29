#!/bin/bash
echo "Waiting for Kafka to be ready..."

# Danh sách toàn bộ các Kafka topics quét được từ source code của ông
TOPICS=(
  "file-uploaded-topic"
  "file-deleted-topic"
  "chat-topic"
  "post-created"
  "notification-delivery"
  "post-liked"
  "post-commented"
  "user-avatar-updated-topic"
  "notification-created"
)

for topic in "${TOPICS[@]}"; do
  echo "Creating topic: $topic"
  kafka-topics --bootstrap-server kafka:9092 --create --if-not-exists --topic "$topic" --partitions 1 --replication-factor 1
done

echo "All Kafka topics created successfully!"