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
    to: mailTo.mentorMail, 
    cc: mailTo.trainerMail,
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
    api.sendMessage({
        chat_id: credentials.chatId,
        text: 'What are the tasks for today?'
    })
    .then(function(data)
    {
        console.log(data);
    })
    .catch(function(err)
    {
        console.log(err);
    });
}

const morningMail = () => {  
    if(mailOptions.text !== '') {
        console.log("in mail", mailOptions.text)
        transporter.sendMail(mailOptions, function (error) {
            if (error) {
                console.log('error:', error); 
                api.sendMessage({ 
                    chat_id : credentials.chatId, 
                    text : error.toString()
                })
            } else {
                console.log('good'); 
                api.sendMessage({ 
                    chat_id : credentials.chatId, 
                    text : 'Sent Successfully!'.toString()
                })
            }
        }); 
    }
    else
        api.sendMessage({ 
            chat_id : credentials.chatId, 
            text : 'List not updated. Kindly send a mail manually!'
        })
    mailOptions.subject = '';
    mailOptions.text = '';
}  

const eveningReminder = () => {
    api.sendMessage({
        chat_id: credentials.chatId,
        text: 'What have you done today?'
    })
    .then(function(data)
    {
        console.log(data);
    })
    .catch(function(err)
    {
        console.log(err);
    });
}

const eveningMail = () => {  
    if(mailOptions.text !== '') {
        console.log("in mail", mailOptions.text);
        transporter.sendMail(mailOptions, function (error) {
            if (error) {
                console.log('error:', error); 
                api.sendMessage({ 
                    chat_id : credentials.chatId, 
                    text : error.toString()
                })
            } else {
                console.log('good'); 
                api.sendMessage({ 
                    chat_id : credentials.chatId, 
                    text : 'Sent Successfully!'.toString()
                })
            }
        }); 
    }
    else
        api.sendMessage({ 
            chat_id : credentials.chatId, 
            text : 'List not updated. Kindly send a mail manually'
        })
    mailOptions.subject = '';
    mailOptions.text = '';
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
        morningMail();
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
        eveningMail();
    }, 
    null, 
    true, 
    'Asia/Kolkata'
);

