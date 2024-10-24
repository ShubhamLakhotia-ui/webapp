sudo apt-get update -y
sudo apt-get install -y nodejs npm,
sudo apt-get install -y unzip


# Check if user csye6225 exists, if not create the user
if ! id -u csye6225 &>/dev/null; then 
    sudo groupadd -f csye6225
    sudo useradd -m -g csye6225 -s /usr/sbin/nologin csye6225
fi  # This closes the if statement