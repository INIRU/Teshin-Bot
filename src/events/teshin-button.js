const { Events } = require('discord.js');
const fs = require('node:fs');

module.exports = {
  name: Events.InteractionCreate,
  once: false,
  execute(interaction) {
    if (!interaction.isButton()) return;

    if (interaction.customId == 'rotation') {
      fs.readFile('./src/database/teshin.json', 'utf-8', async (err, data) => {
        const teshinData = JSON.parse(data);
        let teshinNum = 0;
        for (let i = 0; i < teshinData['rotation'].length; i++) {
          if (
            teshinData['rotation'][i]['name'] ==
            teshinData['currentReward']['name']
          ) {
            teshinNum = i;
          }
        }
        const rotationArray = [].concat(
          teshinData['rotation'].slice(
            teshinNum,
            teshinData['rotation'].length
          ),
          teshinData['rotation'].slice(0, teshinNum)
        );
        let text = '';
        for (const i in rotationArray) {
          if (i != rotationArray.length - 1) {
            text += `${rotationArray[i]['name']} => `;
          } else {
            text += `${rotationArray[i]['name']}`;
          }
        }
        interaction.reply({
          content: `\`\`\`${text}\`\`\``,
          ephemeral: true,
        });
      });
    }
  },
};
