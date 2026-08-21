#!/bin/bash
set -euo pipefail

ACTION="${1:-plan}"
TERRAFORM_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../infrastructure" && pwd)"
PLAN_FILE="$TERRAFORM_DIR/dev.tfplan"

if command -v terraform >/dev/null 2>&1; then
  TERRAFORM_BIN="$(command -v terraform)"
elif [[ -x "$HOME/.local/bin/terraform" ]]; then
  TERRAFORM_BIN="$HOME/.local/bin/terraform"
else
  echo "terraform is required and was not found in PATH" >&2
  exit 1
fi

"$TERRAFORM_BIN" -chdir="$TERRAFORM_DIR" init -input=false
"$TERRAFORM_BIN" -chdir="$TERRAFORM_DIR" validate

case "$ACTION" in
  validate)
    ;;
  plan)
    "$TERRAFORM_BIN" -chdir="$TERRAFORM_DIR" plan \
      -input=false \
      -var-file=dev.tfvars \
      -out="$PLAN_FILE"
    echo "Plan saved to $PLAN_FILE. Review it with: terraform -chdir=infrastructure show dev.tfplan"
    ;;
  apply)
    if [[ ! -f "$PLAN_FILE" ]]; then
      echo "No reviewed plan exists at $PLAN_FILE. Run '$0 plan' first." >&2
      exit 1
    fi
    "$TERRAFORM_BIN" -chdir="$TERRAFORM_DIR" apply "$PLAN_FILE"
    ;;
  *)
    echo "Usage: $0 [validate|plan|apply]" >&2
    exit 1
    ;;
esac
