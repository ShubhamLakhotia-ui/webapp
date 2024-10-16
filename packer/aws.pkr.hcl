packer {
  required_plugins {
    amazon = {
      version = ">= 1.0.0,<2.0.0"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "source_ami" {
  type    = string
  default = "ami-0866a3c8686eaeeba"
}

variable "ami_name" {
  type    = string
  default = "webapp-custom-ami"
}

variable "ssh_username" {
  type    = string
  default = "ubuntu"
}

variable "instance_type" {
  type    = string
  default = "t2.micro"
}

variable "volume_size" {
  type    = number
  default = 25
}

variable "subnet_id" {
  type    = string
  default = "subnet-033ff9d4e0ed2a015"
}

variable "volume_type" {
  type    = string
  default = "gp2"
}

variable "mysql_root_password" {
  type = string
}

variable "db_host" {
  type = string
}

variable "db_name" {
  type = string
}

variable "db_user" {
  type = string
}

variable "db_password" {
  type = string
}

source "amazon-ebs" "ubuntu" {
  region          = var.aws_region
  source_ami      = var.source_ami
  instance_type   = var.instance_type
  ssh_username    = var.ssh_username
  ami_name        = var.ami_name
  subnet_id       = var.subnet_id
  ami_description = "AMI for assignment 4"

  launch_block_device_mappings {
    device_name           = "/dev/sda1"
    volume_size           = var.volume_size
    volume_type           = var.volume_type
    delete_on_termination = true
  }

  tags = {
    Name = "Custom-AMIBuild"
  }

  aws_polling {
    delay_seconds = 120
    max_attempts  = 50
  }
}

build {
  sources = ["source.amazon-ebs.ubuntu"]

  provisioner "shell" {
    inline = [
      "sudo mkdir -p /tmp/webapp",
      "sudo chmod 777 /tmp/webapp"
    ]
  }

  provisioner "file" {
    source      = "webapp.zip"
    destination = "/tmp/webapp.zip"
  }

  provisioner "shell" {
    inline = [
      "sudo apt-get update",
      "sudo apt-get install -y mysql-server",
      "sudo systemctl enable mysql",
      "sudo systemctl start mysql",
      "sudo apt-get install -y nodejs npm",
      "sudo apt-get install -y unzip"
    ]
  }

  provisioner "shell" {
    inline = [
      "cd /tmp",
      "unzip -o webapp.zip -d /tmp/webapp"
    ]
  }

  provisioner "shell" {
    environment_vars = [
      "MYSQL_ROOT_PASSWORD=${var.mysql_root_password}",
      "DB_HOST=${var.db_host}",
      "DB_NAME=${var.db_name}",
      "DB_USER=${var.db_user}",
      "DB_PASSWORD=${var.db_password}"
    ]
    inline = [
      "cd /tmp/webapp/scripts",
      "sudo -E bash setup_mysql.sh"
    ]
  }

  provisioner "shell" {
    environment_vars = [
      "DB_HOST=${var.db_host}",
      "DB_NAME=${var.db_name}",
      "DB_USER=${var.db_user}",
      "DB_PASSWORD=${var.db_password}"
    ]
    inline = [
      "cd /tmp/webapp/scripts",
      "sudo -E bash webapp.sh"
    ]
  }
}
