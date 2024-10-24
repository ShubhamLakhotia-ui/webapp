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

variable "aws_source_ami" {
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

variable "demo_account_id" {
  type = string
}

source "amazon-ebs" "ubuntu" {
  region          = var.aws_region
  source_ami      = var.aws_source_ami
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

  ami_users = ["${var.demo_account_id}"]
}

build {
  sources = ["source.amazon-ebs.ubuntu"]
  provisioner "shell" {
    script = "scripts/installation_script.sh"
  }

  provisioner "shell" {
    inline = [
      "sudo mkdir -p /tmp/webapp",
      "sudo chmod 775 /tmp/webapp",
      "sudo chown -R csye6225:csye6225 /tmp/webapp"
    ]
  }

  provisioner "file" {
    source      = "webapp.zip"
    destination = "/tmp/webapp.zip"
  }

  provisioner "shell" {
    inline = [
      "cd /tmp",
      "sudo unzip -o webapp.zip -d /tmp/webapp",
      "sudo chown -R csye6225:csye6225 /tmp/webapp"
    ]
  }

  provisioner "shell" {
    script = "scripts/webapp.sh"
  }
  post-processor "manifest" {
    output = "manifest.json"
  }

}
