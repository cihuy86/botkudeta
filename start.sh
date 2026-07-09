#!/bin/bash

echo "=========================================="
echo "  🗿 ZAX666 BOT — KUDETA GROUP           "
echo "  👑 Owner: @ZaxSystem__                 "
echo "=========================================="

# Install dependencies jika belum
if [ ! -d "node_modules" ]; then
    echo "[*] Installing dependencies..."
    npm install
fi

# Buat folder wajib
mkdir -p session logs

# Cek session, kalau ga ada → arahkan ke pairing
if [ ! -f "session/creds.json" ]; then
    echo "[!] Session not found. Jalankan 'npm run pair' untuk pairing."
    exit 1
else
    echo "[*] Session found. Starting bot..."
    npm start
fi
