#!/bin/bash
set -euo pipefail

DATA_DIR="${1:-./berka-data}"
BASE_URL="https://sorry.vse.cz/~berka/challenge/pkdd1999"

echo "Downloading Berka dataset from PKDD'99..."

mkdir -p "$DATA_DIR"

# Download files
FILES=(
    "account"
    "client"
    "disp"
    "trans"
    "order"
    "loan"
    "card"
    "district"
)

for file in "${FILES[@]}"; do
    FILE_PATH="$DATA_DIR/$file.asc"
    if [[ -f "$FILE_PATH" ]]; then
        echo "  $file.asc already exists, skipping..."
    else
        echo "  Downloading $file.asc..."
        curl -sS -o "$FILE_PATH" "$BASE_URL/$file.asc" || {
            echo "  Warning: Failed to download $file.asc"
            echo "  Please download manually from $BASE_URL/$file.asc"
        }
    fi
done

echo "Download complete."
echo "Files saved to: $DATA_DIR"
