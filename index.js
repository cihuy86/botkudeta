#!/usr/bin/env node

/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  🗿 ZAX666 BOT — ULTIMATE KUDETA                           ║
 * ║  👑 Owner: @ZaxSystem__                                    ║
 * ║  📱 Owner Number: 6282229038075                           ║
 * ║  🔥 Mode: FULL UNRESTRICTED                                ║
 * ║  ⚡ Commands: KUDETA | CEK | ADDRESS | SETJADIBOT |        ║
 * ║             BLOKIR | GROUPONLY | ADDGRUP                   ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

import { 
    default as makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    Browsers
} from '@whiskeysockets/baileys';

import { Boom } from '@hapi/boom';
import fs from 'fs-extra';
import pino from 'pino';
import chalk from 'chalk';
import moment from 'moment';
import qr from 'qrcode-terminal';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================== PATHS ABSOLUT ====================
const SESSION_DIR = path.join(__dirname, 'session');
const DB_PATH = path.join(__dirname, 'database.json');
const LOG_PATH = path.join(__dirname, 'pairing.log');

// ==================== LOG FILE ====================
function writeLog(msg) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(LOG_PATH, `[${timestamp}] ${msg}\n`);
}

// ==================== CONFIG ====================
const config = {
    owner: "@ZaxSystem__",
    ownerNumber: "6282229038075",   // NOMOR OWNER (TETAP, JANGAN DIUBAH)
    prefix: "/",
    delay: 5000,
    ownerDelay: 1000,
    maxReport: 100
};

// ==================== DATABASE ====================
function loadDB() {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch {
        return { 
            resseller: [],
            jadibot: [],
            blokir: [],
            grup_akses: [],
            report_log: [],
            kudeta_log: []
        };
    }
}

function saveDB() {
    fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2));
}

let dbData = loadDB();

// ==================== LOG ====================
const log = {
    info: (msg) => { console.log(chalk.blue('[INFO]') + ' ' + msg); writeLog('[INFO] ' + msg); },
    success: (msg) => { console.log(chalk.green('[✓]') + ' ' + msg); writeLog('[✓] ' + msg); },
    warn: (msg) => { console.log(chalk.yellow('[⚠]') + ' ' + msg); writeLog('[⚠] ' + msg); },
    error: (msg) => { console.log(chalk.red('[✗]') + ' ' + msg); writeLog('[✗] ' + msg); },
    cmd: (msg) => { console.log(chalk.magenta('[CMD]') + ' ' + msg); writeLog('[CMD] ' + msg); },
    bot: (msg) => { console.log(chalk.cyan('[BOT]') + ' ' + msg); writeLog('[BOT] ' + msg); }
};

// ==================== BANNER ====================
console.log(chalk.yellow(`
╔═══════════════════════════════════════════════════════════════╗
║  🗿 ZAX666 BOT — ULTIMATE KUDETA                           ║
║  👑 Owner: ${config.owner}                                   ║
║  📱 Owner: ${config.ownerNumber}                            ║
║  🟢 Node: ${process.version}                                ║
║  ⚡ Commands: 7+ Fitur Ganas                               ║
║  🔥 Mode: FULL UNRESTRICTED                                ║
╚═══════════════════════════════════════════════════════════════╝
`));

// ==================== VARIABLES ====================
let sock = null;
let isConnected = false;
let startTime = Date.now();

// ==================== DELAY ====================
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ==================== CHECK ACCESS ====================
function checkAccess(sender) {
    const isOwner = sender.includes(config.ownerNumber) || sender.includes(config.owner.replace('@', ''));
    const isResseller = dbData.resseller.includes(sender);
    const isJadibot = dbData.jadibot.includes(sender);
    const isBlocked = dbData.blokir.includes(sender);
    const isGroupAllowed = dbData.grup_akses.includes(sender);
    
    return { 
        isOwner, 
        isResseller, 
        isJadibot, 
        isBlocked,
        isGroupAllowed,
        hasAccess: (isOwner || isResseller || isJadibot) && !isBlocked
    };
}

// ==================== SEND MESSAGE ====================
async function sendMessage(jid, text, quoted = null) {
    try {
        const options = quoted ? { quoted: quoted } : {};
        await sock.sendMessage(jid, { text: text }, options);
    } catch (e) {
        log.error('Send message error: ' + e.message);
    }
}

// ==================== HANDLE MESSAGE ====================
async function handleMessage(from, sender, text, type, msg) {
    if (!text.startsWith(config.prefix)) return;
    
    const cmd = text.slice(1).split(' ')[0].toLowerCase();
    const args = text.slice(1).split(' ').slice(1);
    const { isOwner, isResseller, isJadibot, isBlocked, hasAccess } = checkAccess(sender);

    // Cek blokir
    if (isBlocked) {
        await sendMessage(from, '❌ Anda telah diblokir dari bot ini!');
        return;
    }

    // Cek group only (kecuali owner)
    if (!isOwner && type === 'private') {
        const isAllowed = dbData.grup_akses.includes(sender);
        if (!isAllowed) {
            await sendMessage(from, '❌ Bot hanya bisa digunakan di grup!\nHubungi owner untuk akses.');
            return;
        }
    }

    log.cmd(`${type} | ${sender} | ${cmd}`);

    // ==================== PING ====================
    if (cmd === 'ping') {
        const ping = Date.now() - startTime;
        const text = `🏓 PONG!\n📡 Server: ${Math.round(ping)}ms\n🕒 Uptime: ${moment(startTime).fromNow()}\n👑 ${config.owner}\n📱 Owner: ${config.ownerNumber}`;
        await sendMessage(from, text, msg);
        return;
    }

    // ==================== HELP ====================
    if (cmd === 'help') {
        const helpText = `
╔═══════════════════════════════════════════════════════════════╗
║  🗿 ZAX666 BOT — COMMANDS                                   ║
║  👑 Owner: @ZaxSystem__                                     ║
║  📱 Owner: ${config.ownerNumber}                            ║
╚═══════════════════════════════════════════════════════════════╝

┌───────────────────────────────────────────────────────────────┐
│ 📌 PUBLIC:                                                   │
│  /ping    - Cek koneksi bot                                 │
│  /help    - Menu ini                                         │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│ 🔥 OWNER & RESSELER & JADIBOT:                              │
│  /kudeta [link] - Kudeta grup (tangguhkan)                 │
│  /cek [link]    - Cek status grup                          │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│ 👑 OWNER ONLY:                                               │
│  /address [nomor]     - Tambah resseller                    │
│  /setjadibot [nomor]  - Tambah pengguna pairing             │
│  /blokir [nomor]      - Blokir user                         │
│  /unblokir [nomor]    - Unblokir user                       │
│  /grouponly [on/off]  - Mode grup only                      │
│  /addgrup [link]      - Tambah akses grup                   │
└───────────────────────────────────────────────────────────────┘

🗿 @ZaxSystem__ — BOT SIAP
`;
        await sendMessage(from, helpText, msg);
        return;
    }

    // ==================== KUDETA ====================
    if (cmd === 'kudeta') {
        if (!hasAccess) {
            await sendMessage(from, '❌ Akses ditolak! Hanya Owner, Resseller & Jadibot.\nHubungi @ZaxSystem__', msg);
            return;
        }

        const target = args[0];
        if (!target || !target.includes('chat.whatsapp.com')) {
            await sendMessage(from, '📌 Format: /kudeta [link_grup]\nContoh: /kudeta https://chat.whatsapp.com/xxxxx', msg);
            return;
        }

        await sendMessage(from, '🔥 KUDETA START!\n📌 Memproses grup...\n⏳ Mohon tunggu...', msg);

        try {
            const groupCode = target.split('/').pop();
            await sock.groupAcceptInvite(groupCode);
            
            const groups = await sock.groupFetchAllParticipating();
            let targetId = null;
            let groupName = '';
            for (let g in groups) {
                if (groups[g].inviteCode === groupCode) {
                    targetId = g;
                    groupName = groups[g].subject;
                    break;
                }
            }

            if (!targetId) {
                await sendMessage(from, '❌ Gagal menemukan grup!', msg);
                return;
            }

            const group = await sock.groupMetadata(targetId);
            const participants = group.participants;

            let reported = 0;
            let failed = 0;

            for (let i = 0; i < participants.length; i++) {
                const p = participants[i];
                if (p.id.includes(config.ownerNumber)) continue;

                try {
                    await sock.sendMessage(p.id, { text: '🚨 Laporan dari ZAX666 BOT!' });
                    await delay(isOwner ? config.ownerDelay : config.delay);
                    reported++;
                    
                    if (i % 10 === 0) {
                        await sendMessage(from, `📊 Progress: ${i}/${participants.length}\n✅ Reported: ${reported}\n❌ Failed: ${failed}`, msg);
                    }
                } catch (e) {
                    failed++;
                }
            }

            const resultText = `✅ KUDETA COMPLETE!\n📌 Target: ${groupName}\n✅ Reported: ${reported}\n❌ Failed: ${failed}\n🗿 @ZaxSystem__`;
            await sendMessage(from, resultText, msg);

            dbData.kudeta_log.push({
                target: groupName,
                groupId: targetId,
                link: target,
                reported: reported,
                failed: failed,
                date: new Date().toISOString(),
                reporter: sender
            });
            saveDB();

            await sock.groupLeave(targetId);
        } catch (e) {
            await sendMessage(from, `❌ Error: ${e.message}`, msg);
        }
        return;
    }

    // ==================== CEK ====================
    if (cmd === 'cek') {
        if (!hasAccess) {
            await sendMessage(from, '❌ Akses ditolak! Hanya Owner, Resseller & Jadibot.', msg);
            return;
        }

        const target = args[0];
        if (!target || !target.includes('chat.whatsapp.com')) {
            await sendMessage(from, '📌 Format: /cek [link_grup]', msg);
            return;
        }

        await sendMessage(from, '📊 Mengecek grup...', msg);

        try {
            const groupCode = target.split('/').pop();
            
            // Cek di log kudeta
            const found = dbData.kudeta_log.filter(log => log.link === target || log.groupId === groupCode);
            
            if (found.length > 0) {
                const last = found[found.length - 1];
                const text = `📊 STATUS GRUP:\n📌 Nama: ${last.target}\n✅ Status: PERNAH DIKUDETA!\n📅 Tanggal: ${moment(last.date).format('DD/MM/YYYY HH:mm')}\n👤 Reporter: ${last.reporter}\n📋 Total Report: ${last.reported}`;
                await sendMessage(from, text, msg);
            } else {
                // Coba join untuk cek
                try {
                    await sock.groupAcceptInvite(groupCode);
                    const groups = await sock.groupFetchAllParticipating();
                    let targetId = null;
                    let groupName = '';
                    for (let g in groups) {
                        if (groups[g].inviteCode === groupCode) {
                            targetId = g;
                            groupName = groups[g].subject;
                            break;
                        }
                    }
                    
                    if (targetId) {
                        const group = await sock.groupMetadata(targetId);
                        const text = `📊 INFO GRUP:\n📌 Nama: ${groupName}\n👥 Member: ${group.participants.length}\n📋 Status: AMAN (Belum dikudeta)\n🔗 Link: ${target}`;
                        await sendMessage(from, text, msg);
                        await sock.groupLeave(targetId);
                    } else {
                        await sendMessage(from, '❌ Gagal mengakses grup!', msg);
                    }
                } catch (e) {
                    await sendMessage(from, `❌ Error: ${e.message}`, msg);
                }
            }
        } catch (e) {
            await sendMessage(from, `❌ Error: ${e.message}`, msg);
        }
        return;
    }

    // ==================== ADDRESS ====================
    if (cmd === 'address') {
        if (!isOwner) {
            await sendMessage(from, '❌ Hanya Owner!', msg);
            return;
        }

        const target = args[0];
        if (!target) {
            await sendMessage(from, '📌 Format: /address [nomor]\nContoh: /address 628123456789', msg);
            return;
        }

        if (dbData.resseller.includes(target)) {
            await sendMessage(from, `❌ ${target} sudah terdaftar sebagai resseller!`, msg);
            return;
        }

        dbData.resseller.push(target);
        saveDB();

        await sendMessage(from, `✅ ${target} ditambahkan ke resseller!\n📋 Total resseller: ${dbData.resseller.length}`, msg);
        return;
    }

    // ==================== SETJADIBOT ====================
    if (cmd === 'setjadibot') {
        if (!isOwner) {
            await sendMessage(from, '❌ Hanya Owner!', msg);
            return;
        }

        const target = args[0];
        if (!target) {
            await sendMessage(from, '📌 Format: /setjadibot [nomor]\nContoh: /setjadibot 628123456789', msg);
            return;
        }

        if (dbData.jadibot.includes(target)) {
            await sendMessage(from, `❌ ${target} sudah terdaftar sebagai jadibot!`, msg);
            return;
        }

        dbData.jadibot.push(target);
        saveDB();

        await sendMessage(from, `✅ ${target} ditambahkan ke jadibot!\n📋 Total jadibot: ${dbData.jadibot.length}`, msg);
        return;
    }

    // ==================== BLOKIR ====================
    if (cmd === 'blokir') {
        if (!isOwner) {
            await sendMessage(from, '❌ Hanya Owner!', msg);
            return;
        }

        const target = args[0];
        if (!target) {
            await sendMessage(from, '📌 Format: /blokir [nomor]', msg);
            return;
        }

        if (dbData.blokir.includes(target)) {
            await sendMessage(from, `❌ ${target} sudah diblokir!`, msg);
            return;
        }

        dbData.blokir.push(target);
        saveDB();

        await sendMessage(from, `✅ ${target} diblokir!`, msg);
        return;
    }

    // ==================== UNBLOKIR ====================
    if (cmd === 'unblokir') {
        if (!isOwner) {
            await sendMessage(from, '❌ Hanya Owner!', msg);
            return;
        }

        const target = args[0];
        if (!target) {
            await sendMessage(from, '📌 Format: /unblokir [nomor]', msg);
            return;
        }

        dbData.blokir = dbData.blokir.filter(b => b !== target);
        saveDB();

        await sendMessage(from, `✅ ${target} berhasil diunblokir!`, msg);
        return;
    }

    // ==================== GROUPONLY ====================
    if (cmd === 'grouponly') {
        if (!isOwner) {
            await sendMessage(from, '❌ Hanya Owner!', msg);
            return;
        }

        const mode = args[0];
        if (mode === 'on') {
            dbData.grouponly = true;
            saveDB();
            await sendMessage(from, '✅ Mode GROUP ONLY AKTIF! Bot hanya bisa digunakan di grup.', msg);
        } else if (mode === 'off') {
            dbData.grouponly = false;
            saveDB();
            await sendMessage(from, '✅ Mode GROUP ONLY NONAKTIF! Bot bisa digunakan di private chat.', msg);
        } else {
            await sendMessage(from, '📌 Format: /grouponly [on/off]', msg);
        }
        return;
    }

    // ==================== ADDGRUP ====================
    if (cmd === 'addgrup') {
        if (!isOwner) {
            await sendMessage(from, '❌ Hanya Owner!', msg);
            return;
        }

        const target = args[0];
        if (!target) {
            await sendMessage(from, '📌 Format: /addgrup [link_grup]', msg);
            return;
        }

        try {
            const groupCode = target.split('/').pop();
            await sock.groupAcceptInvite(groupCode);
            
            const groups = await sock.groupFetchAllParticipating();
            let targetId = null;
            let groupName = '';
            for (let g in groups) {
                if (groups[g].inviteCode === groupCode) {
                    targetId = g;
                    groupName = groups[g].subject;
                    break;
                }
            }

            if (!targetId) {
                await sendMessage(from, '❌ Gagal menemukan grup!', msg);
                return;
            }

            if (dbData.grup_akses.includes(targetId)) {
                await sendMessage(from, `❌ Grup ${groupName} sudah memiliki akses!`, msg);
                return;
            }

            dbData.grup_akses.push(targetId);
            saveDB();

            await sendMessage(from, `✅ Grup ${groupName} ditambahkan ke akses!`, msg);
            await sock.groupLeave(targetId);
        } catch (e) {
            await sendMessage(from, `❌ Error: ${e.message}`, msg);
        }
        return;
    }

    // Unknown command
    await sendMessage(from, `❌ Unknown command!\nKetik /help untuk melihat daftar command`, msg);
}

// ==================== PAIRING ====================
async function pairWithCode(code) {
    try {
        writeLog(`Starting pairing for: ${code}`);
        console.log(chalk.cyan(`\n[🔄] Starting pairing for: ${code}`));
        
        if (fs.existsSync(SESSION_DIR)) {
            fs.removeSync(SESSION_DIR);
            writeLog('Session lama dihapus');
            console.log(chalk.yellow('[✓] Session lama dihapus'));
        }

        const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
        
        sock = makeWASocket({
            logger: pino({ level: 'silent' }),
            auth: state,
            browser: Browsers.macOS('Desktop'),
            syncFullHistory: false,
            markOnlineOnConnect: false,
            generateHighQualityLinkPreview: false,
            version: [2, 3000, 1015901307]
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr: qrData, pairingCode } = update;
            
            if (pairingCode) {
                const msg = `PAIRING CODE: ${pairingCode}`;
                writeLog(msg);
                console.log(chalk.green(`\n✅ ${msg}`));
                console.log(chalk.yellow(`📱 Masukkan kode 6 digit di WhatsApp:`));
                console.log(chalk.yellow(`   Settings → Linked Devices → Link a Device`));
                console.log(chalk.yellow(`   Ketik kode: ${pairingCode}\n`));
            }

            if (qrData) {
                console.log(chalk.yellow('\n[QR] Scan dengan WhatsApp:'));
                qr.generate(qrData, { small: true });
                console.log(chalk.cyan('\n📱 Atau gunakan pairing code di atas!\n'));
            }

            if (connection === 'close') {
                const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
                writeLog(`Disconnected: ${statusCode}`);
                console.log(chalk.red(`[✗] Disconnected: ${statusCode}`));
                
                if (statusCode === DisconnectReason.loggedOut) {
                    writeLog('Logged out, deleting session...');
                    console.log(chalk.yellow('[⚠] Logged out, deleting session...'));
                    fs.removeSync(SESSION_DIR);
                    process.exit(0);
                } else {
                    writeLog('Retrying pair...');
                    console.log(chalk.yellow('[🔄] Retrying...'));
                    await delay(5000);
                    await pairWithCode(code);
                }
            } else if (connection === 'open') {
                isConnected = true;
                writeLog('PAIRING SUCCESS! Bot connected.');
                console.log(chalk.green('\n✅ PAIRING SUCCESS!'));
                console.log(chalk.green('✅ Bot connected to WhatsApp!'));
                console.log(chalk.cyan(`📱 Bot Number: ${code}`));
                console.log(chalk.cyan(`👑 Owner: ${config.owner} (${config.ownerNumber})\n`));
                // Langsung lanjut ke connect normal (tapi karena kita sudah di pair, kita return)
                return;
            }
        });

        writeLog(`Requesting pairing code for: ${code}`);
        console.log(chalk.cyan(`[📱] Requesting pairing code for: ${code}`));
        await sock.requestPairingCode(code);
        
        // Tunggu sampai connected
        await new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                if (isConnected) {
                    clearInterval(interval);
                    resolve();
                }
            }, 1000);
            setTimeout(() => {
                clearInterval(interval);
                reject(new Error('Pairing timeout'));
            }, 60000);
        });
        
    } catch (error) {
        writeLog(`Pairing error: ${error.message}`);
        console.log(chalk.red(`[✗] Pairing error: ${error.message}`));
        console.log(chalk.yellow('[📌] Coba alternative: Scan QR code'));
        throw error;
    }
}

// ==================== CONNECT ====================
async function connectToWhatsApp() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
        
        sock = makeWASocket({
            logger: pino({ level: 'silent' }),
            auth: state,
            browser: Browsers.macOS('Desktop'),
            syncFullHistory: false,
            markOnlineOnConnect: false,
            generateHighQualityLinkPreview: false,
            version: [2, 3000, 1015901307]
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr: qrData, pairingCode } = update;
            
            if (pairingCode) {
                const msg = `PAIRING CODE: ${pairingCode}`;
                writeLog(msg);
                console.log(chalk.green(`\n✅ ${msg}`));
                console.log(chalk.yellow(`📱 Masukkan kode 6 digit di WhatsApp:`));
                console.log(chalk.yellow(`   Settings → Linked Devices → Link a Device`));
                console.log(chalk.yellow(`   Ketik kode: ${pairingCode}\n`));
            }

            if (qrData) {
                console.log(chalk.yellow('\n[QR] Scan dengan WhatsApp:'));
                qr.generate(qrData, { small: true });
            }

            if (connection === 'close') {
                const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
                writeLog(`Disconnected: ${statusCode}`);
                console.log(chalk.red(`[✗] Disconnected: ${statusCode}`));
                isConnected = false;
                
                if (statusCode === DisconnectReason.loggedOut) {
                    writeLog('Logged out, deleting session...');
                    console.log(chalk.yellow('[⚠] Logged out, deleting session...'));
                    fs.removeSync(SESSION_DIR);
                    process.exit(0);
                } else {
                    writeLog('Reconnecting...');
                    console.log(chalk.yellow('[🔄] Reconnecting...'));
                    await delay(5000);
                    await connectToWhatsApp();
                }
            } else if (connection === 'open') {
                isConnected = true;
                writeLog('Connected to WhatsApp');
                console.log(chalk.green('\n✅ Connected to WhatsApp!'));
                console.log(chalk.cyan(`👑 Owner: ${config.owner} (${config.ownerNumber})`));
                console.log(chalk.green(`✅ ZAX666 BOT ULTIMATE is ready!\n`));
                console.log(chalk.yellow(`📋 COMMANDS:`));
                console.log(chalk.yellow(`   /kudeta [link] - Kudeta grup`));
                console.log(chalk.yellow(`   /cek [link] - Cek status grup`));
                console.log(chalk.yellow(`   /address [nomor] - Tambah resseller`));
                console.log(chalk.yellow(`   /setjadibot [nomor] - Tambah jadibot`));
                console.log(chalk.yellow(`   /blokir [nomor] - Blokir user`));
                console.log(chalk.yellow(`   /unblokir [nomor] - Unblokir user`));
                console.log(chalk.yellow(`   /grouponly [on/off] - Mode grup only`));
                console.log(chalk.yellow(`   /addgrup [link] - Tambah akses grup\n`));
            }
        });

        sock.ev.on('messages.upsert', async (m) => {
            const msg = m.messages[0];
            if (!msg.message || msg.key.fromMe) return;
            
            const from = msg.key.remoteJid;
            const sender = msg.key.participant || from;
            const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
            const type = msg.key.remoteJid?.endsWith('@g.us') ? 'group' : 'private';
            
            await handleMessage(from, sender, text, type, msg);
        });

    } catch (error) {
        writeLog(`Connection error: ${error.message}`);
        console.log(chalk.red(`[✗] Connection error: ${error.message}`));
        await delay(5000);
        await connectToWhatsApp();
    }
}

// ==================== MAIN ====================
async function main() {
    const args = process.argv.slice(2);

    // Buat folder
    const folders = [SESSION_DIR, './logs'];
    for (const folder of folders) {
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
            console.log(chalk.green(`[✓] Created: ${folder}`));
        }
    }

    // Pairing mode
    if (args[0] === 'pair') {
        let code = args[1];
        if (!code) {
            // Minta input nomor secara interaktif
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            code = await new Promise(resolve => {
                rl.question(chalk.cyan('📱 Masukkan nomor WhatsApp yang akan dijadikan bot (contoh: 628123456789): '), answer => {
                    resolve(answer.trim());
                    rl.close();
                });
            });
        }
        if (!code) {
            console.log(chalk.red('❌ Nomor tidak boleh kosong!'));
            process.exit(1);
        }
        // Validasi sederhana: pastikan angka
        if (!/^\d+$/.test(code)) {
            console.log(chalk.red('❌ Nomor harus berupa angka (tanpa + atau spasi)!'));
            process.exit(1);
        }

        writeLog(`Pairing mode started for ${code}`);
        console.log(chalk.cyan(`\n📱 PAIRING MODE`));
        console.log(chalk.cyan(`📌 Nomor: ${code}`));
        console.log(chalk.cyan(`💡 Pastikan WhatsApp di HP sudah login!`));
        console.log(chalk.cyan(`📌 Kode pairing akan muncul di bawah (6 digit)\n`));
        
        try {
            await pairWithCode(code);
            // Setelah pairing sukses, lanjut connect normal
            writeLog('Pairing success, starting normal connection...');
            console.log(chalk.green('\n[✓] Pairing sukses, menghubungkan bot...'));
            await connectToWhatsApp();
        } catch (e) {
            writeLog(`Pairing failed: ${e.message}`);
            console.log(chalk.red(`[✗] Pairing gagal: ${e.message}`));
            console.log(chalk.yellow('Coba jalankan tanpa argumen pair untuk QR code.'));
            process.exit(1);
        }
        return;
    }

    // Normal mode (tanpa pair)
    writeLog('Starting normal mode...');
    console.log(chalk.cyan('\n[🚀] Starting ZAX666 BOT ULTIMATE...'));
    console.log(chalk.cyan(`👑 Owner: ${config.owner} (${config.ownerNumber})`));
    console.log(chalk.cyan(`[🟢] Node Version: ${process.version}`));
    console.log(chalk.cyan(`[📌] Untuk pairing pertama kali, jalankan: npm run pair\n`));
    await connectToWhatsApp();
}

// ==================== START ====================
main().catch(err => {
    writeLog(`Fatal error: ${err.message}`);
    console.log(chalk.red('[✗] Error: ' + err.message));
    console.log(err);
});

process.on('SIGINT', () => {
    writeLog('Bot stopped by user');
    console.log(chalk.yellow('\n[⚠] Bot stopped by user'));
    process.exit(0);
});
