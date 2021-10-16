terraform {
  backend "local" {}
}

provider "aws" {
  region = "us-west-2"
}

resource "aws_s3_bucket" "example" {
  bucket_prefix = var.bucket_name
}

variable "bucket_name" {
  type = string
  default = "skyform-example"
}