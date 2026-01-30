#!/bin/bash
# ============================================
# Nexus LMS - Deployment Script
# Prerequisites: aws-cli, terraform, kubectl, docker
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${1:-dev}
AWS_REGION=${AWS_REGION:-ap-south-1}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# ─────────────────────────────────────────
# Helper Functions
# ─────────────────────────────────────────
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    local missing=()
    
    command -v aws >/dev/null 2>&1 || missing+=("aws-cli")
    command -v terraform >/dev/null 2>&1 || missing+=("terraform")
    command -v kubectl >/dev/null 2>&1 || missing+=("kubectl")
    command -v docker >/dev/null 2>&1 || missing+=("docker")
    command -v kustomize >/dev/null 2>&1 || missing+=("kustomize")
    
    if [ ${#missing[@]} -ne 0 ]; then
        log_error "Missing required tools: ${missing[*]}"
        echo "Please install the missing tools and try again."
        exit 1
    fi
    
    log_success "All prerequisites are installed"
}

check_aws_credentials() {
    log_info "Checking AWS credentials..."
    
    if ! aws sts get-caller-identity >/dev/null 2>&1; then
        log_error "AWS credentials not configured or invalid"
        echo "Please run: aws configure"
        exit 1
    fi
    
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    log_success "AWS Account: $AWS_ACCOUNT_ID"
}

# ─────────────────────────────────────────
# Infrastructure Deployment
# ─────────────────────────────────────────
deploy_infrastructure() {
    log_info "Deploying infrastructure for: $ENVIRONMENT"
    
    cd "$PROJECT_ROOT/terraform"
    
    # Initialize Terraform
    log_info "Initializing Terraform..."
    terraform init
    
    # Plan
    log_info "Creating Terraform plan..."
    terraform plan \
        -var-file="environments/$ENVIRONMENT/terraform.tfvars" \
        -out=tfplan
    
    # Apply
    read -p "Apply Terraform changes? (y/n): " confirm
    if [ "$confirm" == "y" ]; then
        terraform apply tfplan
        log_success "Infrastructure deployed successfully"
    else
        log_warning "Deployment cancelled"
        exit 0
    fi
    
    # Get outputs
    EKS_CLUSTER_NAME=$(terraform output -raw eks_cluster_name)
    ECR_CLIENT_URL=$(terraform output -json ecr_repository_urls | jq -r '.["nexus-client"]')
    ECR_SERVER_URL=$(terraform output -json ecr_repository_urls | jq -r '.["nexus-server"]')
    
    export EKS_CLUSTER_NAME ECR_CLIENT_URL ECR_SERVER_URL
}

# ─────────────────────────────────────────
# Build and Push Docker Images
# ─────────────────────────────────────────
build_and_push_images() {
    log_info "Building and pushing Docker images..."
    
    cd "$PROJECT_ROOT"
    
    # Login to ECR
    log_info "Logging into ECR..."
    aws ecr get-login-password --region $AWS_REGION | \
        docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
    
    # Build client
    log_info "Building client image..."
    docker build \
        -t "$ECR_CLIENT_URL:$ENVIRONMENT-latest" \
        -t "$ECR_CLIENT_URL:$(git rev-parse --short HEAD)" \
        -f docker/Dockerfile.client \
        --build-arg VITE_API_URL="https://api.$ENVIRONMENT.nexus-lms.com" \
        .
    
    docker push "$ECR_CLIENT_URL" --all-tags
    log_success "Client image pushed"
    
    # Build server
    log_info "Building server image..."
    docker build \
        -t "$ECR_SERVER_URL:$ENVIRONMENT-latest" \
        -t "$ECR_SERVER_URL:$(git rev-parse --short HEAD)" \
        -f docker/Dockerfile.server \
        .
    
    docker push "$ECR_SERVER_URL" --all-tags
    log_success "Server image pushed"
}

# ─────────────────────────────────────────
# Deploy to Kubernetes
# ─────────────────────────────────────────
deploy_to_kubernetes() {
    log_info "Deploying to Kubernetes..."
    
    # Update kubeconfig
    log_info "Updating kubeconfig..."
    aws eks update-kubeconfig --region $AWS_REGION --name $EKS_CLUSTER_NAME
    
    # Create namespace
    kubectl create namespace "nexus-lms-$ENVIRONMENT" --dry-run=client -o yaml | kubectl apply -f -
    
    # Deploy using Kustomize
    cd "$PROJECT_ROOT/k8s/overlays/$ENVIRONMENT"
    
    # Update image tags
    kustomize edit set image \
        "nexus-client=$ECR_CLIENT_URL:$ENVIRONMENT-latest" \
        "nexus-server=$ECR_SERVER_URL:$ENVIRONMENT-latest"
    
    # Apply
    log_info "Applying Kubernetes manifests..."
    kustomize build . | kubectl apply -f -
    
    # Wait for rollout
    log_info "Waiting for deployment rollout..."
    kubectl rollout status deployment/nexus-client-$ENVIRONMENT -n "nexus-lms-$ENVIRONMENT" --timeout=300s
    kubectl rollout status deployment/nexus-server-$ENVIRONMENT -n "nexus-lms-$ENVIRONMENT" --timeout=300s
    
    log_success "Kubernetes deployment complete"
    
    # Get ingress URL
    INGRESS_URL=$(kubectl get ingress -n "nexus-lms-$ENVIRONMENT" -o jsonpath='{.items[0].status.loadBalancer.ingress[0].hostname}')
    log_info "Application URL: http://$INGRESS_URL"
}

# ─────────────────────────────────────────
# Run Database Migrations
# ─────────────────────────────────────────
run_migrations() {
    log_info "Running database migrations..."
    
    kubectl run prisma-migrate-$(date +%s) \
        --namespace "nexus-lms-$ENVIRONMENT" \
        --image="$ECR_SERVER_URL:$ENVIRONMENT-latest" \
        --restart=Never \
        --rm \
        --wait \
        --command -- npx prisma migrate deploy
    
    log_success "Database migrations complete"
}

# ─────────────────────────────────────────
# Main
# ─────────────────────────────────────────
main() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║           Nexus LMS - Deployment Script                   ║"
    echo "║           Environment: $ENVIRONMENT                              ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo ""
    
    check_prerequisites
    check_aws_credentials
    
    echo ""
    echo "Select deployment option:"
    echo "1) Full deployment (Infrastructure + Build + Deploy)"
    echo "2) Infrastructure only (Terraform)"
    echo "3) Build and deploy only (Docker + K8s)"
    echo "4) Deploy only (K8s - images must exist)"
    echo "5) Run database migrations"
    echo ""
    read -p "Enter option [1-5]: " option
    
    case $option in
        1)
            deploy_infrastructure
            build_and_push_images
            deploy_to_kubernetes
            run_migrations
            ;;
        2)
            deploy_infrastructure
            ;;
        3)
            # Get values from terraform
            cd "$PROJECT_ROOT/terraform"
            EKS_CLUSTER_NAME=$(terraform output -raw eks_cluster_name 2>/dev/null || echo "")
            ECR_CLIENT_URL=$(terraform output -json ecr_repository_urls 2>/dev/null | jq -r '.["nexus-client"]' || echo "")
            ECR_SERVER_URL=$(terraform output -json ecr_repository_urls 2>/dev/null | jq -r '.["nexus-server"]' || echo "")
            
            if [ -z "$EKS_CLUSTER_NAME" ]; then
                log_error "Infrastructure not deployed. Run option 1 or 2 first."
                exit 1
            fi
            
            build_and_push_images
            deploy_to_kubernetes
            run_migrations
            ;;
        4)
            cd "$PROJECT_ROOT/terraform"
            EKS_CLUSTER_NAME=$(terraform output -raw eks_cluster_name 2>/dev/null || echo "")
            ECR_CLIENT_URL=$(terraform output -json ecr_repository_urls 2>/dev/null | jq -r '.["nexus-client"]' || echo "")
            ECR_SERVER_URL=$(terraform output -json ecr_repository_urls 2>/dev/null | jq -r '.["nexus-server"]' || echo "")
            
            deploy_to_kubernetes
            ;;
        5)
            cd "$PROJECT_ROOT/terraform"
            EKS_CLUSTER_NAME=$(terraform output -raw eks_cluster_name 2>/dev/null || echo "")
            ECR_SERVER_URL=$(terraform output -json ecr_repository_urls 2>/dev/null | jq -r '.["nexus-server"]' || echo "")
            
            aws eks update-kubeconfig --region $AWS_REGION --name $EKS_CLUSTER_NAME
            run_migrations
            ;;
        *)
            log_error "Invalid option"
            exit 1
            ;;
    esac
    
    echo ""
    log_success "Deployment complete!"
}

main
