#!/bin/bash
# -----------------------------------------------
# CloudYeti Demo - Infrastructure Misconfiguration
# -----------------------------------------------

set -e

STACK_NAME="cloudyeti-demo"
REGION="${AWS_DEFAULT_REGION:-us-east-1}"
TEMPLATE="$(dirname "$0")/demo-stack.yaml"

case "${1:-}" in
  deploy)
    echo "=== Deploying healthy stack ==="
    aws cloudformation deploy \
      --template-file "$TEMPLATE" \
      --stack-name "$STACK_NAME" \
      --region "$REGION" \
      --capabilities CAPABILITY_NAMED_IAM \
      --parameter-overrides DeployBrokenVersion=false

    IP=$(aws cloudformation describe-stacks \
      --stack-name "$STACK_NAME" \
      --region "$REGION" \
      --query "Stacks[0].Outputs[?OutputKey=='WebServerPublicIP'].OutputValue" \
      --output text)

    echo ""
    echo "Waiting 30s for EC2 userdata to install httpd..."
    sleep 30

    echo "Testing: curl http://$IP"
    curl -s --max-time 5 "http://$IP" && echo "" && echo "SUCCESS - Web server is reachable."
    ;;

  break)
    echo "=== Deploying BROKEN version ==="
    echo "This changes the SG from port 80 -> 8080 and adds a NACL deny on port 80."
    echo ""
    aws cloudformation deploy \
      --template-file "$TEMPLATE" \
      --stack-name "$STACK_NAME" \
      --region "$REGION" \
      --capabilities CAPABILITY_NAMED_IAM \
      --parameter-overrides DeployBrokenVersion=true

    IP=$(aws cloudformation describe-stacks \
      --stack-name "$STACK_NAME" \
      --region "$REGION" \
      --query "Stacks[0].Outputs[?OutputKey=='WebServerPublicIP'].OutputValue" \
      --output text)

    echo ""
    echo "Testing: curl http://$IP (should fail/timeout)..."
    curl -s --max-time 5 "http://$IP" || echo "EXPECTED FAILURE - Web server is unreachable. The bug is live."
    echo ""
    echo "=== READY FOR DEMO ==="
    echo ""
    echo "Tell your agent:"
    echo "  \"Our web server at $IP is unreachable. It was working earlier today."
    echo "   The team says nothing changed. Investigate why traffic can't reach it.\""
    ;;

  test)
    IP=$(aws cloudformation describe-stacks \
      --stack-name "$STACK_NAME" \
      --region "$REGION" \
      --query "Stacks[0].Outputs[?OutputKey=='WebServerPublicIP'].OutputValue" \
      --output text)
    echo "Testing http://$IP ..."
    curl -v --max-time 5 "http://$IP" 2>&1 || echo "UNREACHABLE"
    ;;

  destroy)
    echo "=== Tearing down demo stack ==="
    aws cloudformation delete-stack --stack-name "$STACK_NAME" --region "$REGION"
    echo "Stack deletion initiated. Resources will be cleaned up in ~2 min."
    ;;

  *)
    echo "CloudYeti Agentic AI Demo"
    echo ""
    echo "Usage: ./run-demo.sh [deploy|break|test|destroy]"
    echo ""
    echo "  deploy   - Deploy the healthy infrastructure (VPC + EC2 web server)"
    echo "  break    - Redeploy with misconfigured SG + NACL (simulates bad change)"
    echo "  test     - Quick curl test to check if web server is reachable"
    echo "  destroy  - Tear down everything"
    echo ""
    echo "Demo flow:"
    echo "  1. ./run-demo.sh deploy     # Working web server"
    echo "  2. ./run-demo.sh test       # Confirm it works"
    echo "  3. ./run-demo.sh break      # Simulate infra misconfiguration"
    echo "  4. ./run-demo.sh test       # Confirm it's broken"
    echo "  5. Point your agent at it   # Record the investigation"
    echo "  6. ./run-demo.sh destroy    # Clean up"
    ;;
esac
