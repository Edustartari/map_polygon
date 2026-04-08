#!/bin/bash

# Cron job to make GET request to redis-update endpoint
# Runs every minute

# Make GET request to the endpoint
curl -s -X GET "https://map-polygon.vercel.app/redis-update/" >> /tmp/cron_job.log 2>&1

# Log timestamp
echo "Request sent at: $(date)" >> /tmp/cron_job.log
