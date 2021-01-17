const Discord = require("discord.js");
const fs = require("fs");
const bot = new Discord.Client()
const config = require("./botconfig");
const request = require('request'); 
const refresh = 10;
const IP = ""; //Server IP + Port [:30120]
const nazwa_serwera = "connect .." 



bot.commands = new Discord.Collection();


fs.readdir("./komendy/", (err, files) => {
	if(err) console.log(err)
	let jsfile = files.filter(f => f.split(".").pop() === "js");
	if(jsfile.length <= 0){
		console.log("Brak Komendy");
		return;
	}
	
	jsfile.forEach((f, i) => {
		let props = require(`./komendy/${f}`);
        console.log(`${f} Został załadowany!`);
        bot.commands.set(props.help.name, props);
	});
	
});

bot.on("message", async message => {
  if(message.author.bot) return;
  if(message.channel.type === "dm") return;

  let prefix = config.prefix;
  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  let args = messageArray.slice(1);
  let commandfile = bot.commands.get(cmd.slice(prefix.length));
  if(commandfile) commandfile.run(bot,message,args);


  if(message.content == "!say"){
      var embed = new Discord.MessageEmbed()
      .setTitle("Zune Software")
      message.reply(embed)

  }

});

bot.on('ready', async () => {
    console.log("Bot zostal odpalony.");
})
 
bot.on("ready", async () => {
    const channel = bot.channels.cache.get(config.kanalst);
    const message = await channel.messages.fetch(config.wiadomoscst);

    setInterval(async () => {
        request(`http://${config.ipst}/players.json`, async (error, _, body) => {
            if (error){
                const embed = new Discord.MessageEmbed()
                    .setColor(`${config.kolorst}`)
                    .setTitle('Serwer OFF')
                    .addField('Adres:', `${nazwa_serwera}`, true)
                    .setFooter(`${config.nazwafoost}`, bot.user.displayAvatarURL)
                    .setTimestamp();
                    return await message.edit(embed);
             }
            const players = JSON.parse(body);
            playersStringList = [];
            let buff = "";
            for(const player of players){
                const paddedId = new String(player.id).padStart(3, '0');
                const steamHex = player.identifiers[0];
                const playerString = `${paddedId}   ${player.name} \n`;
                if((buff.length + playerString.length) > 1024) {
                    playersStringList.push(buff);
                    buff = "";
                }
                buff += playerString;
            }
            playersStringList.push(buff);
            const embed = new Discord.MessageEmbed()
                .setColor(`${config.kolorst}`)
                .setTitle(`${config.nazwaglst}`)
                .addField("Adres:", `${nazwa_serwera}`, true)
                .addField("Gracze:", `${players.length}/${config.maksst}`, true)
                .setFooter(`${config.nazwafoost}`, bot.user.displayAvatarURL)
                .setThumbnail(message.author.avatarURL)
                .setTimestamp();
            for(let i = 0; i < playersStringList.length; i++){
                embed.addField(`ID:  NICK: `, playersStringList);
            
            }
            return await message.edit(embed);
                 
        });
    },10 * 1000);
});

bot.login(config.token);
