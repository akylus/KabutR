const tokenJson = require('./token.json');
const credentials = require('./credentials.json');
const mailTimes = require('./mailTimes.json');
const mailTo = require('./mailTo.json');
const nodemailer = require('nodemailer');
let telegram = require('telegram-bot-api');
let CronJob = require('cron').CronJob;
const botToken = tokenJson.token;

console.log("Listening...");


let mailerConfig = {    
    service: 'Godaddy',
    host: "smtpout.secureserver.net",  
    secureConnection: true,
    port: 587,
    auth: {
        user: credentials.email,
        pass: credentials.password
    }
};

let transporter = nodemailer.createTransport(mailerConfig);

let mailOptions = {
    from: mailerConfig.auth.user,
    to: mailTo.mentor, 
    cc: mailTo.trainer,
    bcc: mailTo.self,
    subject: '',
    text: ''
};

let api = new telegram({
        token: botToken,
        updates: {
        	enabled: true
    }
});

const morningReminder = () => {
    sendNewMessage('What are the tasks for today?');
}

const eveningReminder = () => {
    sendNewMessage('What have you done today?');
}

const sendMail = () => {  
    if(mailOptions.text !== '') {
        console.log("in mail", mailOptions.text);
        transporter.sendMail(mailOptions, function (error) {
            if (error) {
                console.log('error:', error); 
                sendNewMessage(error.toString());
            } else {
                sendNewMessage('Sent Successfully!');
            }
        }); 
    }
    else
        sendNewMessage('List not updated. Kindly send a mail manually');
    mailOptions.subject = '';
    mailOptions.text = '';
}  

const sendNewMessage = (msg) => {
    api.sendMessage({ 
        chat_id : credentials.chatId, 
        text : msg
    })
} 

const formatText = (text) => {
    text = text.split("\n");
    text = text.slice(1,text.length);
    let i = 0;
    finalText = text.map(listItem => {   
        return (`${++i}. ${listItem}\n`)
    })
    finalText = finalText.join("");
    return finalText
}

const getCurrentDate = () => {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); 
    today = dd + '/' + mm;
    return today;
}

api.on('message', function(message)
{
    let textReceived = message.text;
    let firstLetter = textReceived.slice(0, 1);
    let remainingText = textReceived.slice(1, textReceived.length);
    let formattedText = formatText(remainingText);

    let date = getCurrentDate();
    
    if(firstLetter === '@') {
        finalText = "Here's what I am planning on getting done today: \n" + formattedText + "\nThank you,\nRegards,\nKaustubh." 
        mailOptions.subject = "Work to do | " + date;
        mailOptions.text =  finalText.toString();
        console.log(mailOptions.subject);
        console.log(mailOptions.text);
    }
        
    else if(firstLetter === '*') {
        finalText = "Here's what I have done today: \n" + formattedText + "\nThank you,\nRegards,\nKaustubh." 
        mailOptions.subject = "Daily Work Report | " + date;
        mailOptions.text =  finalText.toString();
        console.log(mailOptions.subject);
        console.log(mailOptions.text);
    }

    else if(textReceived === 'ping')
        sendNewMessage('pong')
});



var morningReminderJob = new CronJob(
    mailTimes.morningReminderTime, 
    function() {
        morningReminder();
    }, 
    null, 
    true, 
    'Asia/Kolkata'
);

var morningMailJob = new CronJob(
    mailTimes.morningMailTime,
    function() {
        sendMail();
    }, 
    null, 
    true, 
    'Asia/Kolkata'
);

var eveningReminderJob = new CronJob(
    mailTimes.eveningReminderTime, 
    function() {
        eveningReminder();
    }, 
    null, 
    true, 
    'Asia/Kolkata'
);

var eveningMailJob = new CronJob(
    mailTimes.eveningMailTime, 
    function() {
        sendMail();
    }, 
    null, 
    true, 
    'Asia/Kolkata'
);

