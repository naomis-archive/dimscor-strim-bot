import { Client, GatewayIntentBits, Message } from "discord.js";

import { logHandler } from "./utils/logHandler";
let lastMessage: Message<boolean> | null = null;

(async () => {
  const bot = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  });

  bot.on("ready", () => {
    logHandler.log("info", "Bot is ready!");
  });

  bot.on("voiceStateUpdate", async (oldState, newState) => {
    if (newState.member?.id !== process.env.OWNER_ID) {
      return;
    }

    if (
      (oldState.streaming && !newState.streaming) ||
      (lastMessage && !newState.channelId)
    ) {
      await lastMessage?.edit(
        `Naomi has stopped streaming in <#${oldState.channelId}>`
      );
      if (lastMessage) {
        lastMessage = null;
      }
      return;
    }

    if (!oldState.streaming && newState.streaming) {
      const channel = await newState.guild.channels.fetch(
        process.env.NOTIFICATION_CHANNEL as string
      );
      if (!channel || !("send" in channel)) {
        return;
      }
      const sent = await channel.send(
        `Heya <@&${process.env.NOTIFICATION_ROLE}>~!\n\nNaomi is now streaming in <#${newState.channelId}>`
      );
      if (!lastMessage || lastMessage.id !== sent.id) {
        lastMessage = sent;
      }
      return;
    }
  });

  await bot.login(process.env.TOKEN);
})();
