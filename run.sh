#!/bin/bash

# Script to run CRE workflow simulation and execute all cron triggers sequentially
# This script runs the workflow multiple times with delays to trigger each cron handler

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Create log file with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$PROJECT_DIR/workflow_execution_${TIMESTAMP}.log"

TRIGGERS=(
    "onDeployTokenizer"
    "onDepositCollaterals"
    "onRedeemCollaterals"
    "onDeposit1155"
    "onWithdraw1155"
)

TOTAL=${#TRIGGERS[@]}
DELAY=2  # Delay in seconds between each trigger execution

{
echo "======================================================================"
echo "Starting CRE Workflow Simulation with Cron Triggers"
echo "======================================================================"
echo ""
echo "Total triggers to execute: $TOTAL"
echo "Delay between triggers: ${DELAY}s"
echo "Log file: $LOG_FILE"
echo ""

cd "$PROJECT_DIR"

for i in "${!TRIGGERS[@]}"; do
    TRIGGER="${TRIGGERS[$i]}"
    STEP=$((i + 1))
    
    echo "======================================================================"
    echo "Step $STEP/$TOTAL: Triggering - $TRIGGER"
    echo "======================================================================"
    echo ""
    
    # Run the workflow simulation with broadcast
    # Each execution will trigger the cron handlers
    echo "Running: cre workflow simulate tokenized-workflow --broadcast"
    echo ""
    
    cre workflow simulate tokenized-workflow --broadcast
    
    echo ""
    echo "✓ Trigger completed: $TRIGGER"
    echo ""
    
    # Add delay between triggers (except for the last one)
    if [ $STEP -lt $TOTAL ]; then
        echo "Waiting ${DELAY}s before next trigger..."
        sleep "$DELAY"
    fi
done

echo "======================================================================"
echo "All cron triggers have been executed successfully!"
echo "======================================================================"
echo ""
echo "Log saved to: $LOG_FILE"
} 2>&1 | tee "$LOG_FILE"
