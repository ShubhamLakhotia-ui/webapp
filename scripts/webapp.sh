


# sudo mkdir -p /opt/webapp

# sudo cp -r /tmp/webapp/. /opt/webapp/

# sudo chown -R csye6225:csye6225 /opt/webapp

# cd /opt/webapp
# sudo -u csye6225 npm install

# sudo cp /tmp/webapp/config/webapp.service /etc/systemd/system/
# sudo chown root:root /etc/systemd/system/webapp.service


# sudo bash -c "cat <<EOF > /etc/webapp.env
# DB_HOST='${DB_HOST}'
# DB_NAME='${DB_NAME}'
# DB_USER='${DB_USER}'
# DB_PASSWORD='${DB_PASSWORD}'
# EOF"


# sudo chmod 600 /etc/webapp.env
# sudo chown root:root /etc/webapp.env

# sudo systemctl daemon-reload

# sudo systemctl enable webapp


# sudo systemctl start webapp

# Create /opt/webapp directory
sudo mkdir -p /opt/webapp

# Copy web application files from /tmp/webapp to /opt/webapp
sudo cp -r /tmp/webapp/. /opt/webapp/
sudo chown -R csye6225:csye6225 /opt/webapp  # Ensure csye6225 owns all files

# Navigate to the application directory and install npm dependencies if package.json is present
cd /opt/webapp
if [ -f "package.json" ]; then
    sudo -u csye6225 npm install  # Run npm install as csye6225
else
    echo "package.json not found, skipping npm install"
fi

SERVICE_FILE="/tmp/webapp/config/webapp.service"
if [ -f "$SERVICE_FILE" ]; then
    sudo cp "$SERVICE_FILE" /etc/systemd/system/
    sudo chown root:root /etc/systemd/system/webapp.service
else
    echo "webapp.service not found!"
    exit 1
fi


sudo systemctl daemon-reload
sudo systemctl enable webapp
