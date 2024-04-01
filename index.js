import {
  Client,
  Events,
  GatewayIntentBits,
  Partials,
  ChannelType,
} from "discord.js";
import * as http from "http";

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DESTINATION_CHANNEL = process.env.DESTINATION_CHANNEL;
const DM_REPLY_MESSAGE = process.env.DM_REPLY_MESSAGE;

const main = () => {
  const bot = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.DirectMessageReactions,
    ],
    partials: [Partials.Channel, Partials.Message],
  });

  bot.once(Events.ClientReady, () => {
    console.log(`Logged in as ${bot.user.tag}!`);
    bot.user.setActivity(`send DM`, { type: "PLAYING" });
  });

  bot.on(Events.MessageCreate, (message) => {
    // without public channel
    if (message.channel.type !== ChannelType.DM) {
      return;
    }

    // without bot message
    if (message.author.bot) {
      return;
    }

    // send the message to the destination channel
    const destinationChannel = bot.channels.cache.get(DESTINATION_CHANNEL);
    destinationChannel.send(message.content);

    // notify a user that the message has been sent
    message.channel.send(DM_REPLY_MESSAGE);
  });

  bot.login(DISCORD_TOKEN);
};

http
  .createServer(function (req, res) {
    if (req.method == "POST") {
      var data = "";
      req.on("data", function (chunk) {
        data += chunk;
      });
      req.on("end", function () {
        if (!data) {
          console.log("No post data");
          res.end();
          return;
        }
        var dataObject = querystring.parse(data);
        console.log("post:" + dataObject.type);
        if (dataObject.type == "wake") {
          console.log("Woke up in post");
          res.end();
          return;
        }
        res.end();
      });
    } else if (req.method == "GET") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Discord Bot is active now\n");
    }
  })
  .listen(3000);

main();
