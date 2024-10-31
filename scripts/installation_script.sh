#!/bin/bash

# Update package list and install necessary packages
sudo apt-get update -y
sudo apt-get install -y nodejs npm
sudo apt-get install -y unzip

curl -O https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb


# Clean up the downloaded .deb file
rm amazon-cloudwatch-agent.deb
sudo mkdir -p /opt/aws/amazon-cloudwatch-agent/etc/

 cat << 'EOF' | sudo tee /opt/aws/amazon-cloudwatch-agent/etc/cwagent-config.json
{
    "agent": {
        "metrics_collection_interval": 10,
        "logfile":"/var/log/amazon-cloudwatch-agent.log"
    },
    "logs": {
        "logs_collected": {
            "files": {
                "collect_list": [
                 {
                    "file_path": "/var/log/syslog",
                    "log_group_name": "syslog",
                    "log_stream_name": "webapp"
                 }
                ]
            }
        }
    },
    "metrics": {
        "metrics_collected": {
            "statsd":{
                "service_address":":8125",
                "metrics_collection_interval":60,
                "metrics_aggregation_interval":300
            }
        }
    }
}
EOF


# Check if user 'csye6225' exists, if not create the user
if ! id -u csye6225 &>/dev/null; then
    sudo groupadd -f csye6225
    sudo useradd -m -g csye6225 -s /usr/sbin/nologin csye6225
    echo "User csye6225 created."
else
    echo "User csye6225 already exists."
fi

sudo chown -R csye6225:csye6225 /opt/aws/amazon-cloudwatch-agent/etc
sudo chmod 775 /opt/aws/amazon-cloudwatch-agent/etc

echo "Installation script completed successfully."