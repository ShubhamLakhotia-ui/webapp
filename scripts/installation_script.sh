#!/bin/bash

# Update package list and install necessary packages
sudo apt-get update -y
sudo apt-get install -y nodejs npm
sudo apt-get install -y unzip

# Check if user 'csye6225' exists, if not create the user
if ! id -u csye6225 &>/dev/null; then
    sudo groupadd -f csye6225
    sudo useradd -m -g csye6225 -s /usr/sbin/nologin csye6225
    echo "User csye6225 created."
else
    echo "User csye6225 already exists."
fi

curl -O https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb

# Clean up the downloaded .deb file
rm amazon-cloudwatch-agent.deb

echo "Installation script completed successfully."