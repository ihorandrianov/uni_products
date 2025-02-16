#!/bin/bash

# Create DLQ
awslocal sqs create-queue \
    --queue-name my-dlq \
    --attributes '{
        "MessageRetentionPeriod": "1209600"
    }'

# Get DLQ ARN
DLQ_ARN=$(awslocal sqs get-queue-attributes \
    --queue-url "http://localhost:4566/000000000000/my-dlq" \
    --attribute-names QueueArn \
    --query 'Attributes.QueueArn' \
    --output text)

# Create main queue with DLQ policy
awslocal sqs create-queue \
    --queue-name notifications.fifo \
    --attributes "{
        \"RedrivePolicy\": \"{\\\"deadLetterTargetArn\\\":\\\"${DLQ_ARN}\\\",\\\"maxReceiveCount\\\":\\\"3\\\"}\",
        \"VisibilityTimeout\": \"30\",
        \"FifoQueue\": \"true\",
        \"ContentBasedDeduplication\": \"true\"
    }"

touch /tmp/init-finished
