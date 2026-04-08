#!/bin/bash

# Cron job to make GET request to redis-update endpoint
# Runs every minute

# Make GET request to the endpoint
curl -s -X GET "https://map-polygon.vercel.app/redis-update/" >> /tmp/cron_job.log 2>&1

# Log timestamp
echo "Request sent at: $(date)" >> /tmp/cron_job.log

# # Echo the current OS used in the build process
# echo "Current OS: $(uname -a)"
# # Echo the current linux distribution
# if [ -f /etc/os-release ]; then
#     . /etc/os-release
#     echo "Linux Distribution: $NAME $VERSION"
# else
#     echo "Linux distribution information not found."
# fi

# # Set the cronjob to run every minute
# dnf update -y && dnf install -y cronie
# # Start crond daemon in background
# crond &
# # Get the absolute path of the cron job script
# cronjob_path="$(pwd)/cron_job.sh"
# chmod +x "$cronjob_path"
# echo "Made $cronjob_path executable"
# (crontab -l 2>/dev/null; echo "* * * * * $cronjob_path") | crontab -
# echo "Crontab updated successfully"
# crontab -l


