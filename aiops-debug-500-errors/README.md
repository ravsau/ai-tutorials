# Debug 500 Errors with AI

A hands-on lab where you deploy a serverless stack that fails at runtime. Your mission: trace the failure across services using CloudWatch Logs and fix it with help from AI.

## Architecture
```
API Gateway → Lambda → DynamoDB
```

The stack deploys successfully, but API calls return a generic 500 error. You'll need to dig into logs to find the real problem.

## Prerequisites

- AWS Account with admin access
- Basic familiarity with AWS Console

## Deploy the Stack

1. Open **AWS CloudFormation Console**
2. Click **Create stack** → **With new resources (standard)**
3. Select **Template is ready** → **Upload a template file**
4. Copy the template below and save as `template.yaml`, then upload it
5. Stack name: `cloudyeti-debug-500-lab`
6. Click **Next** → **Next** → Check "I acknowledge that AWS CloudFormation might create IAM resources" → **Submit**
7. Wait for `CREATE_COMPLETE` (~2-3 minutes)

### CloudFormation Template
```yaml
AWSTemplateFormatVersion: "2010-09-09"
Description: CloudYeti AIOps Lab - Debug 500 Errors with AI

Resources:
  OrdersTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: cloudyeti-orders
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: pk
          AttributeType: S
      KeySchema:
        - AttributeName: pk
          KeyType: HASH

  OrderLambdaRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Effect: Allow
            Principal:
              Service: lambda.amazonaws.com
            Action: sts:AssumeRole
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
      Policies:
        - PolicyName: DynamoDBAccess
          PolicyDocument:
            Version: "2012-10-17"
            Statement:
              - Effect: Allow
                Action:
                  - dynamodb:PutItem
                  - dynamodb:GetItem
                  - dynamodb:Query
                Resource: !GetAtt OrdersTable.Arn

  OrderLambda:
    Type: AWS::Lambda::Function
    Properties:
      FunctionName: cloudyeti-order-processor
      Runtime: python3.12
      Handler: index.handler
      Role: !GetAtt OrderLambdaRole.Arn
      Timeout: 10
      Environment:
        Variables:
          TABLE_NAME: !Ref OrdersTable
      Code:
        ZipFile: |
          import json
          import boto3
          import os
          import logging

          logger = logging.getLogger()
          logger.setLevel(logging.INFO)

          dynamodb = boto3.resource('dynamodb')
          table = dynamodb.Table(os.environ['TABLE_NAME'])

          def handler(event, context):
              logger.info(f"Received event: {json.dumps(event)}")
              
              try:
                  body = event.get('body')
                  if body is None:
                      return {"statusCode": 400, "body": json.dumps({"error": "Missing request body"})}
                  
                  if isinstance(body, str):
                      body = json.loads(body)
                  
                  order_id = body.get('orderId')
                  customer = body.get('customer')
                  amount = body.get('amount')
                  
                  if not all([order_id, customer, amount]):
                      return {"statusCode": 400, "body": json.dumps({"error": "Missing required fields: orderId, customer, amount"})}
                  
                  logger.info(f"Processing order: {order_id} for customer: {customer}")
                  
                  item = {
                      "orderId": order_id,
                      "customer": customer,
                      "amount": str(amount),
                      "status": "PENDING"
                  }
                  
                  logger.info(f"Attempting to write item: {json.dumps(item)}")
                  
                  table.put_item(Item=item)
                  
                  logger.info(f"Order {order_id} saved successfully")
                  return {
                      "statusCode": 201,
                      "body": json.dumps({"message": "Order created", "orderId": order_id})
                  }
                  
              except json.JSONDecodeError as e:
                  logger.error(f"JSON parsing error: {str(e)}")
                  return {"statusCode": 400, "body": json.dumps({"error": "Invalid JSON in request body"})}
              except Exception as e:
                  logger.error(f"Unexpected error: {str(e)}")
                  raise

  LambdaApiPermission:
    Type: AWS::Lambda::Permission
    Properties:
      FunctionName: !Ref OrderLambda
      Action: lambda:InvokeFunction
      Principal: apigateway.amazonaws.com
      SourceArn: !Sub "arn:aws:execute-api:${AWS::Region}:${AWS::AccountId}:${OrderApi}/*"

  OrderApi:
    Type: AWS::ApiGateway::RestApi
    Properties:
      Name: cloudyeti-orders-api
      Description: CloudYeti AIOps Lab - Order Processing API

  OrdersResource:
    Type: AWS::ApiGateway::Resource
    Properties:
      RestApiId: !Ref OrderApi
      ParentId: !GetAtt OrderApi.RootResourceId
      PathPart: orders

  OrdersPostMethod:
    Type: AWS::ApiGateway::Method
    Properties:
      RestApiId: !Ref OrderApi
      ResourceId: !Ref OrdersResource
      HttpMethod: POST
      AuthorizationType: NONE
      Integration:
        Type: AWS_PROXY
        IntegrationHttpMethod: POST
        Uri: !Sub "arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${OrderLambda.Arn}/invocations"

  ApiDeployment:
    Type: AWS::ApiGateway::Deployment
    DependsOn: OrdersPostMethod
    Properties:
      RestApiId: !Ref OrderApi

  ApiStage:
    Type: AWS::ApiGateway::Stage
    Properties:
      RestApiId: !Ref OrderApi
      DeploymentId: !Ref ApiDeployment
      StageName: prod
      MethodSettings:
        - ResourcePath: "/*"
          HttpMethod: "*"
          LoggingLevel: INFO
          DataTraceEnabled: true

Outputs:
  ApiEndpoint:
    Description: API Gateway endpoint URL
    Value: !Sub "https://${OrderApi}.execute-api.${AWS::Region}.amazonaws.com/prod/orders"
  
  LambdaName:
    Description: Lambda function name
    Value: !Ref OrderLambda
  
  LambdaLogGroup:
    Description: Lambda CloudWatch Log Group
    Value: !Sub "/aws/lambda/${OrderLambda}"
  
  TableName:
    Description: DynamoDB table name
    Value: !Ref OrdersTable
```

## Trigger the Failure

1. Go to **API Gateway Console**
2. Click on **cloudyeti-orders-api**
3. In the left sidebar, click **Resources**
4. Click on **POST** under `/orders`
5. Click the **Test** tab
6. In **Request Body**, paste:
```json
{"orderId": "ORD-001", "customer": "Saurav", "amount": 99.99}
```

7. Click **Test**

You should see a **500 error** with `{"message": "Internal server error"}`

## Investigate the Logs

1. Go to **CloudWatch Console** → **Log groups**
2. Find `/aws/lambda/cloudyeti-order-processor`
3. Click the latest log stream
4. Look for the error message and copy the relevant log entries

## Debug with AI

Open ChatGPT or Claude and paste:
```
I'm debugging a serverless application: API Gateway → Lambda → DynamoDB

When I POST to the API, I get a generic "Internal server error" (500).

Here's my Lambda code:
[PASTE THE LAMBDA CODE FROM THE TEMPLATE]

Here's what I found in CloudWatch Logs:
[PASTE THE LOG ENTRIES]

My DynamoDB table is named "cloudyeti-orders".

1. What exactly went wrong?
2. How do I verify the table schema using AWS CLI or Console?
3. What's the fix?
```

## Apply the Fix

Based on AI's recommendation:

1. Go to **Lambda Console** → `cloudyeti-order-processor`
2. Edit the code
3. Click **Deploy**

## Verify the Fix

Go back to API Gateway and test again:

1. **API Gateway** → **cloudyeti-orders-api** → **Resources** → **POST** → **Test**
2. Request Body:
```json
{"orderId": "ORD-002", "customer": "CloudYeti", "amount": 149.99}
```

3. Click **Test**

You should now see: `{"message": "Order created", "orderId": "ORD-002"}`

## Cleanup

Delete the stack to avoid charges:

1. Go to **CloudFormation Console**
2. Select `cloudyeti-debug-500-lab`
3. Click **Delete**

Or via CLI:
```bash
aws cloudformation delete-stack --stack-name cloudyeti-debug-500-lab
```

## What You Learned

- Generic 500 errors hide the real problem - always check Lambda logs
- AI can correlate logs + code to pinpoint root causes quickly
- Schema mismatches between application code and database are common in production

## Video

Watch the walkthrough: [CloudYeti YouTube](https://youtube.com/@cloudyeti)
