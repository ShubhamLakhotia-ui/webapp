# sudo mkdir -p /opt/webapp
# sudo cp -r /tmp/webapp/. /opt/webapp/
# sudo chown -R csye6225:csye6225 /opt/webapp/
# cd /opt/webapp
# sudo -u csye6225 npm install
# sudo cp /tmp/webapp/config/webapp.service /etc/systemd/system/
# sudo chown root:root /etc/systemd/system/webapp.service

# sudo bash -c "cat <<EOF > /etc/weapp.env
# DB HOST='${DB HOST}'
# DB_NAME= '${DB_NAME}
# DB_USER='${DB_USER}
# DB_PASSWORD='${DB PASSWORD}'
# EOF"
# sudo chmod 600 /etc/webapp.env
# sudo chown root:root /etc/webapp.env

# sudo mkdir -p /app
# sudo chown csye6225:csye6225 /app
# sudo systemctl daemon-reload
# sudo systemctl enable webapp
# sudo systemctl start webapp

# sudo mkdir -p /opt/webapp
# sudo cp -r /tmp/webapp/. /opt/webapp/
# sudo chown -R csye6225:csye6225 /opt/webapp

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



# Create the directory for the web application
sudo mkdir -p /opt/webapp

# Copy the application files from /tmp/webapp to /opt/webapp
sudo cp -r /tmp/webapp/. /opt/webapp/

# Change ownership of the application directory to the csye6225 user
sudo chown -R csye6225:csye6225 /opt/webapp

# Navigate to the application directory and install npm dependencies as the csye6225 user
cd /opt/webapp
sudo -u csye6225 npm install

# Copy the systemd service file for the web application to the system's service directory
sudo cp /tmp/webapp/config/webapp.service /etc/systemd/system/
sudo chown root:root /etc/systemd/system/webapp.service

# Create an environment file with database credentials
sudo bash -c "cat <<EOF > /etc/webapp.env
DB_HOST='${DB_HOST}'
DB_NAME='${DB_NAME}'
DB_USER='${DB_USER}'
DB_PASSWORD='${DB_PASSWORD}'
EOF"

# Set secure permissions on the environment file
sudo chmod 600 /etc/webapp.env
sudo chown root:root /etc/webapp.env

# Reload the systemd daemon to recognize the new service
sudo systemctl daemon-reload

# Enable the web application service to start on boot
sudo systemctl enable webapp

# Start the web application service
sudo systemctl start webapp
