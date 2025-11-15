#!/bin/bash

# Wait for Cassandra to be ready
echo "Waiting for Cassandra to be ready..."

max_attempts=30
attempt=0

until cqlsh cassandra -e "describe cluster" > /dev/null 2>&1; do
  attempt=$((attempt + 1))
  if [ $attempt -eq $max_attempts ]; then
    echo "Cassandra did not become ready in time"
    exit 1
  fi
  echo "Waiting for Cassandra... (attempt $attempt/$max_attempts)"
  sleep 5
done

echo "Cassandra is ready!"

# Start the application
exec "$@"
