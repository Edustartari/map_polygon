set -o errexit

echo "BUILD START"

# create a virtual environment named 'venv' if it doesn't already exist
python3.9 -m venv venv

# activate the virtual environment
source venv/bin/activate

pip install -r requirements.txt

cd frontend/
npm install -D webpack-cli
npm run build

cd ..
python manage.py collectstatic --noinput
python manage.py migrate

# Echo the current OS used in the build process
echo "Current OS: $(uname -a)"
# Echo the current linux distribution
if [ -f /etc/os-release ]; then
    . /etc/os-release
    echo "Linux Distribution: $NAME $VERSION"
else
    echo "Linux distribution information not found."
fi

# Set the cronjob to run every minute
dnf update -y && dnf install -y cronie
# Start crond daemon in background
crond &
# Get the absolute path of the cron job script
cronjob_path="$(pwd)/cron_job.sh"
chmod +x "$cronjob_path"
echo "Made $cronjob_path executable"
crontab -e <<EOF
* * * * * $cronjob_path
EOF
echo "Crontab updated successfully"
crontab -l

echo "BUILD END"