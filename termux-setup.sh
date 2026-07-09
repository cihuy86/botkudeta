#!/data/data/com.termux/files/usr/bin/bash
# ============================================================
#  🗿 ZAX666 BOT — TERMUX INSTALLER & LAUNCHER
#  👑 Owner: @ZaxSystem__
#  🔥 Mode: FULL UNRESTRICTED
# ============================================================

clear
echo "=========================================="
echo "  🗿 ZAX666 BOT — KUDETA GROUP           "
echo "  👑 Owner: @ZaxSystem__                 "
echo "=========================================="

# Cek Termux environment
if [ ! -d /data/data/com.termux ]; then
    echo "[!] Ini bukan Termux! Keluar."
    exit 1
fi

# Update & install dependencies
echo "[*] Updating Termux packages..."
pkg update -y && pkg upgrade -y

echo "[*] Installing Node.js & required tools..."
pkg install -y nodejs-lts git python

# Cek Node.js
NODE_VER=$(node -v 2>/dev/null)
if [ -z "$NODE_VER" ]; then
    echo "[!] Node.js gagal terinstall. Coba manual: pkg install nodejs-lts"
    exit 1
fi
echo "[✓] Node.js version: $NODE_VER"

# Cek npm
npm -v >/dev/null 2>&1 || { echo "[!] npm tidak ditemukan."; exit 1; }

# Buat folder yang diperlukan
mkdir -p session logs

# Install dependencies proyek
echo "[*] Installing npm dependencies..."
npm install --no-fund --no-audit

# Cek apakah session sudah ada
if [ ! -f "session/creds.json" ]; then
    echo "[!] Session tidak ditemukan."
    echo "[!] Jalankan pairing dengan perintah: npm run pair"
    echo "[!] Nanti akan diminta memasukkan nomor WhatsApp."
    echo ""
    # Jalankan pair (yang akan minta input nomor)
    npm run pair
else
    echo "[✓] Session ditemukan."
    # Jalankan bot
    if command -v pm2 &> /dev/null; then
        echo "[*] Menjalankan dengan PM2..."
        pm2 start ecosystem.config.js
        pm2 logs zax666-bot
    else
        echo "[*] Menjalankan langsung (tanpa PM2). Gunakan screen/tmux untuk background."
        npm start
    fi
fi
