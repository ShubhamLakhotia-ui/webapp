
sudo systemctl enable mysql
sudo systemctl start mysql

# Alter the root user to use mysql_native_password with the given password
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH 'mysql_native_password' BY '${MYSQL_ROOT_PASSWORD}';"

# Create the csye6225 group and user if they don't exist
sudo groupadd -f csye6225
sudo id -u csye6225 &>/dev/null || sudo useradd -m -g csye6225 -s /usr/sbin/nologin csye6225

# Create MySQL user and grant necessary privileges
mysql -u root -p"${MYSQL_ROOT_PASSWORD}" -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';"

# Create the database if it doesn't exist
mysql -u root -p"${MYSQL_ROOT_PASSWORD}" -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;"

# Grant all privileges on the database to the new user
mysql -u root -p"${MYSQL_ROOT_PASSWORD}" -e "GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';"

# Apply the changes by flushing the privileges
mysql -u root -p"${MYSQL_ROOT_PASSWORD}" -e "FLUSH PRIVILEGES;"
