const Discord = require('discord.js');
const request = require("request");
const rgbcolor = require('rgbcolor');
const getImageColors = require('get-image-colors');
const inspect  = require("util");
const vm = require("vm");
const fs = require ("fs");
const codeContext =  {};
const prefix = ".";
vm.createContext(codeContext);
const client = new Discord.Client({ autofetch: [
    'MESSAGE_CREATE',
    'MESSAGE_UPDATE',
    'MESSAGE_REACTION_ADD',
    'MESSAGE_REACTION_REMOVE',
]});
const rule = {
    own: "419562566512017415",
    trusted_own: "430006994607538201",
    ban_hammer: "417267817763831808",
    game_admin: "417312252463677451",
    moder: "426411685595578382"
};
const func = require('./func.js');

client.commands = new Discord.Collection();
client.categories = new Discord.Collection();

fs.readdir("./commands/", (err, files) => {

    let commandCount = 0;

    if (err) console.error(err);
    if (files.length <= 0) {
        console.log("Категорий нет.");
        return;
    }
    files.forEach((c, ci, ca) => {
        if (!fs.existsSync(`./commands/${c}/config.json`)) return console.error(`Категория ${c} не загружена: не обнаружен файл конфигурации категории.`);
        let cat_info = require("./commands/"+c+"/config.json");
        console.log(`Категория ${c} загружена`);
        client.categories.set(c, cat_info);
        fs.readdir("./commands/"+c+"/", (err, cmds) => {
        let jsfile = cmds.filter(c => c.endsWith('.js'));
            jsfile.forEach((f, fi, fa) => {
                let props = require(`./commands/${c}/${f}`);
                let commandName = f.replace(/\.js$/i, '');

                console.log(`Команда ${commandName} загружена`);
                commandCount++;
                props.info.code = props;
                props.info.category = c;
                client.commands.set(props.info.command, props.info );
                if (fi === fa.length - 1 && ci === ca.length - 1) {
                    let letter;
                    if (commandCount === 1) letter = 'а'; else letter = 'о';
                console.log(`-----\nБот запущен\nВсего загружен${func.declOfNum(commandCount, ['а', 'о', 'о'])} ${commandCount} ${func.declOfNum(commandCount, ['команда', 'команды', 'команд'])}`);}
            });
        });
    });
    
});
let lang_phrases = {
    'ru': {
        'help': {
            'list': 'Список команд',
        }
    },
    'ua': {
        'help': {
            'list': 'Список команд',
        }
    },
    'en': {
        'help': {
            'list': 'List of commands',
        }
    },
    'pl': {
        'help': {
            'list': 'Lista poleceń',
        }
    }
};
client.on('message', async (message) => {
    let lang = 'ru';
    let l = lang_phrases[lang];
    if (message.content.indexOf(prefix) !== 0) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    
    if (command.match(/^(h[e|a]lpe?|п[а|о]м[а|о]([щ|ш]ь?|ги))/im)) {
    	message.delete();
        let cmds = '';
        client.categories.forEach((category, cat_info) => {
            cmds += category + ':\n';
            client.commands.filter(m => m.category === category).forEach(cmd => {
	            cmds += ' '+prefix+cmd.name+'\n';
            })
        });
        message.channel.send(`\`\`\`asciidoc\n:: ${l['help']['list']} ::\n\n${cmds}\`\`\``);
        return;
    }
    let commandfile = client.commands.filter(m => {
        return command.match(new RegExp(m.command, 'im'));
    }).first();
    console.log(commandfile);
    if (commandfile) commandfile.code.run(client, message, command, args, commandfile.info, lang);
});
client.login(process.env.BOT_TOKEN).catch(console.error);
process.env.BOT_TOKEN = process.env.POSLANIYE;