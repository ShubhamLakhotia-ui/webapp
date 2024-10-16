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

sudo mkdir -p /opt/webapp
sudo cp -r /tmp/webapp/. /opt/webapp/
sudo chown -R csye6225:csye6225 /opt/webapp

sudo -u csye6225 npm install  

sudo cp /tmp/webapp/config/webapp.service /etc/systemd/system/
sudo chown root:root /etc/systemd/system/webapp.service

sudo bash -c "cat <<EOF > /etc/webapp.env
DB_HOST='${DB_HOST}'
DB_NAME='${DB_NAME}'
DB_USER='${DB_USER}'
DB_PASSWORD='${DB_PASSWORD}'
EOF"

sudo chmod 600 /etc/webapp.env
sudo chown root:root /etc/webapp.env

sudo systemctl daemon-reload

sudo systemctl enable webapp

sudo systemctl start webapp

