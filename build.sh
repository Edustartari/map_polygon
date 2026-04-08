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

# Set the cronjob to run every minute
sudo apt-get update && sudo apt-get install -y cron
# Get the absolute path of the cron job script
cronjob_path="$(pwd)/cron_job.sh"
chmod +x "$cronjob_path"
echo "Made $cronjob_path executable"
(crontab -l 2>/dev/null; echo "* * * * * $cronjob_path") | crontab -
echo "Crontab updated successfully"
crontab -l

echo "BUILD END"