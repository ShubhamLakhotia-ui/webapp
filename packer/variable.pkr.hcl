variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "source_ami" {
  type    = string
  default = "ami-0866ca3c806eaeeba"
}

variable "ami_name" {
  type    = string
  default = "webapp-custom-ami_${formatdate("YYYY_MM_DD", timestamp())}"
}

variable "ssh_username" {
  type    = string
  default = "ubuntu"
}

variable "default_vpc_id" {
  type    = string
  default = "vpc-0e427732da9ecded9"
}

variable "instance_type" {
  type    = string
  default = "t2.micro"
}

variable "subnet_id" {
  type    = string
  default = "subnet-09db6335be6abc4e6"
}

variable "ami_regions" {
  type    = list(string)
  default = ["us-east-1", "us-east-2"]
}

variable "volume_size" {
  type    = number
  default = 25
}

variable "volume_type" {
  type    = string
  default = "gp2"
}
