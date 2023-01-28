const {
  Events,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const moment = require("moment");
const fs = require("node:fs");

function CreateText(text) {
  const data = require("../database/teshin.json");
  const steelEmoji = "<:steel:1067069433593479278>";
  const listData = ["rotation", "evergreens"];
  for (let key in listData) {
    for (let i in data[listData[key]]) {
      if (data[listData[key]][i]["name"] == text) {
        return `**${data[listData[key]][i]["emoji"]}${
          data[listData[key]][i]["name"]
        } ${steelEmoji} × ${data[listData[key]][i]["cost"]}**\n`;
      }
    }
  }
}

function Unix_timestampConv(time) {
  return Math.floor(new Date(time).getTime() / 1000);
}

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    setInterval(function () {
      let channel = client.channels.cache.get("961881095727620106");
      fs.readFile("./src/database/teshin.json", "utf-8", async (err, data) => {
        if (err) throw err;
        const teshinData = JSON.parse(data);
        var teshinNum = 0;
        for (let i = 0; i < teshinData["rotation"].length; i++) {
          if (
            teshinData["rotation"][i]["name"] ==
            teshinData["currentReward"]["name"]
          ) {
            if (i + 1 > teshinData["rotation"].length) {
              continue;
            }
            teshinNum = i + 1;
          }
        }
        if (Date.parse(new Date()) > Date.parse(teshinData["expiry"])) {
          teshinData["currentReward"] = teshinData["rotation"][teshinNum];
          teshinData["activation"] = moment(teshinData["activation"])
            .add(7, "day")
            .format();
          teshinData["expiry"] = moment(teshinData["expiry"])
            .add(7, "day")
            .format();
          fs.writeFileSync(
            "./src/database/teshin.json",
            JSON.stringify(teshinData)
          );
        } else {
          return;
        }
        const weeklyTeshin = [].concat(
          teshinData["currentReward"],
          teshinData["evergreens"]
        );
        const SliceTeshin = [
          weeklyTeshin.slice(0, 10),
          weeklyTeshin.slice(10, 20),
        ];
        let text = [];
        for (let key in SliceTeshin) {
          let temp = "";
          for (let value in SliceTeshin[key]) {
            temp += CreateText(SliceTeshin[key][value]["name"]);
          }
          text.push(temp);
        }
        const TeshinEmbed = new EmbedBuilder()
          .setColor(0x131313)
          .setAuthor({
            name: "강철의 길 훈장",
            iconURL: client.user.avatarURL(),
          })
          .setFooter({
            text: "powerd by INIRU",
            iconURL: (
              await client.users.fetch("340124004599988234")
            ).avatarURL(),
          });
        for (let i in text) {
          let name = "> **이번 주 로테이션**";
          if (i == 1) {
            name = "\u200b";
          }
          TeshinEmbed.addFields({
            name: name,
            value: text[i],
            inline: true,
          });
        }
        teshinNum = 0;
        for (let i = 0; i < teshinData["rotation"].length; i++) {
          if (
            teshinData["rotation"][i]["name"] ==
            teshinData["currentReward"]["name"]
          ) {
            if (i + 1 > teshinData["rotation"].length) {
              continue;
            }
            teshinNum = i + 1;
          }
        }
        TeshinEmbed.addFields({
          name: "> **다음 주 로테이션**",
          value: CreateText(teshinData["rotation"][teshinNum]["name"]),
          inline: false,
        });
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("rotation")
            .setLabel("로테이션 항목")
            .setEmoji("1067069433593479278")
            .setStyle(ButtonStyle.Success)
        );
        channel.messages.fetch("1068879673884422245").then((msg) => {
          msg.edit({
            embeds: [TeshinEmbed],
            components: [row],
            content: `**<t:${Unix_timestampConv(
              Date.parse(teshinData["activation"])
            )}> ~ <t:${Unix_timestampConv(
              Date.parse(teshinData["expiry"])
            )}> (<t:${Unix_timestampConv(
              Date.parse(teshinData["expiry"])
            )}:R> 종료)**`,
          });
        });
      });
    }, 1000);
  },
};
