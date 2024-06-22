# Recipe Sharing APP

This is a simple Recipe Sharing application built with Express.js. It provides a RESTful API for word processing. The application can perform CRUD (Create, Read, Update, Delete) operations on recipes.

## Features

- Health Check Endpoint: Ensures the application is running.
- Get All Recipes: Retrieve a list of all recipes.
- Get Recipe by ID: Retrieve a specific recipe by its ID.
- Create Recipe: Add a new recipe.
- Update Recipe: Update an existing recipe.
- Delete Recipe: Delete a recipe by its ID.

## Prerequisites

- Node.js (v14.x or higher)
- Docker
- AWS CLI
- AWS SSM Plugin
- Git

## Setup

### Local Development

1; Clone the Repository

```bash
git clone https://github.com/saksman3/recipe-app.git
cd recipe-app
```

2; Install Dependencies

```bash
npm install 
```

3; Start Application

```bash
npm start
```

The app should start running at http://localhost:3000.

### Docker

1; Build the docker image:

```bash
docker build -t recipe-app .
```

2; Run the Docker Container:

```bash
docker run -p 80:3000 recipe-app
```
This will start the container and binds the container port 3000 to the host port 3000 
You can access the app on http://localhost:3000

## AWS EC2 Deployment

### Provision EC2 Instance

1. Launch an EC2 instance with a suitable Amazon Linux 2 AMI.
Ensure the instance is in a private subnet and has an associated IAM role with ECR and SSM permissions.

``` JSON
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ecr:GetAuthorizationToken",
                "ecr:BatchCheckLayerAvailability",
                "ecr:GetDownloadUrlForLayer",
                "ecr:BatchGetImage",
                "ecr:PutImage",
                "ssm:SendCommand"
            ],
            "Resource": "*"
        }
    ]
}
```

2. Connect to the EC2 Instance using AWS SSM:

```bash
aws ssm start-session --target <instance-id>

```

3. Install Docker on EC2 Instance

```bash
sudo amazon-linux-extras install docker
sudo service docker start
sudo usermod -a -G docker ec2-user

```

4. Clone the repository on EC2 Instance:

```bash
git clone https://github.com/saksman3/recipe-app.git
cd recipe-app
```

5. Build image and Run container on the instance

```bash
docker build -t recipe-sharing-app .
docker run -d -p 80:3000 recipe-sharing-app

```

## GitHub Actions Workflow for Auto Deployment

You can use the following GitHub Actions workflow to automate the deployment of your application to EC2 instances: workflow located in directory `.github/workflows/deploy_app.yaml`
```yaml
name: Build and Push Docker Image to AWS ECR

on:
  push:
    branches:
      - main  # Adjust branch name as needed

env:
  AWS_REGION: us-east-1  # Update with your AWS region
  AWS_ACCOUNT_ID: ${{ secrets.AWS_ACCOUNT_ID }}  # Replace with your AWS account ID
  ECR_REPOSITORY: medium-app-repo  # Replace with your ECR repository name

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v2

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build, tag, and push image to Amazon ECR
        id: build-image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: ${{ env.ECR_REPOSITORY }}
          IMAGE_TAG: "latest"
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

      - name: Retrieve EC2 instance IPs by Tag
        id: ec2-instances
        run: |
          INSTANCE_IDS=$(aws ec2 describe-instances --filters "Name=tag:Name,Values=dev-nginx-app-alb-waf-instance" --query "Reservations[*].Instances[*].InstanceId" --output json)
          instance_ids=$(echo "$INSTANCE_IDS" | jq -r '.[][]')
          instance_ids=$(echo "$instance_ids" | paste -sd " " -)
          echo "Found instances: $instance_ids"
          echo "::set-output name=instance_ids::$instance_ids"

      - name: Retrieve EC2 instanceIds and Deploy Containers
        id: ec2-container-deploy
        run: |
          aws ssm send-command --instance-ids ${{ steps.ec2-instances.outputs.instance_ids }} --document-name "AWS-RunShellScript" --comment "Deploy Docker container" --parameters '{"commands":["docker pull ${{ steps.ecr-login.outputs.registry }}/$ECR_REPOSITORY:latest","docker stop recipe-sharing-app || true","docker rm recipe-sharing-app || true","docker run -d -p 80:3000 --name recipe-sharing-app ${{ steps.ecr-login.outputs.registry }}/$ECR_REPOSITORY:latest"]}'

```

## API Endpoints

- Health check `/`
- Get All Recipes `/recipes`
- Get Recipes by id `/recipes/:id`
- Create New Recipe 

```bash
POST /recipes
Body: {
  "name": "Recipe Name",
  "ingredients": ["ingredient1", "ingredient2"],
  "instructions": "Recipe instructions"
}
```

- Update an Existing Recipe

```bash
PUT /recipes/:id
Body: {
  "name": "Updated Recipe Name",
  "ingredients": ["ingredient1", "ingredient2"],
  "instructions": "Updated recipe instructions"
}
```

- Delete A Recipe

```bash
DELETE /recipes/:id
```

For any queries or issues, please contact [saksman3@gmail.com].