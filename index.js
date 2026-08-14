const {
  Client,
  GatewayIntentBits,
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// CONFIGURAÇÕES DO TICKET
const CONFIG = {
  categoria: null, // coloque aqui o ID da categoria de tickets
  cargoStaff: null, // coloque aqui o ID do cargo da staff
  nomeCanal: "ticket-{user}",
  mensagem: "Clique no botão abaixo para abrir um ticket."
};

// Comando /ticket
const comandos = [
  new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Envia o painel de atendimento.")
];

client.once("ready", async () => {
  console.log(`Carl Cat conectado como ${client.user.tag}`);

  for (const [guildId, guild] of client.guilds.cache) {
    await guild.commands.set(comandos);
  }

  console.log("Comando /ticket registrado.");
});

client.on("interactionCreate", async interaction => {

  // COMANDO /TICKET
  if (interaction.isChatInputCommand() && interaction.commandName === "ticket") {

    const embed = new EmbedBuilder()
      .setTitle("🎫 Atendimento")
      .setDescription(CONFIG.mensagem)
      .setColor(0x5865F2)
      .setFooter({ text: "Carl Cat • Sistema de Tickets" });

    const botao = new ButtonBuilder()
      .setCustomId("abrir_ticket")
      .setLabel("Abrir Ticket")
      .setEmoji("🎫")
      .setStyle(ButtonStyle.Primary);

    const linha = new ActionRowBuilder()
      .addComponents(botao);

    await interaction.reply({
      embeds: [embed],
      components: [linha]
    });
  }

  // BOTÃO ABRIR TICKET
  if (interaction.isButton() && interaction.customId === "abrir_ticket") {

    const guild = interaction.guild;

    const existente = guild.channels.cache.find(
      canal =>
        canal.type === ChannelType.GuildText &&
        canal.name === `ticket-${interaction.user.username.toLowerCase()}`
    );

    if (existente) {
      return interaction.reply({
        content: `Você já possui um ticket aberto: ${existente}`,
        ephemeral: true
      });
    }

    const permissoes = [
      {
        id: guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel]
      },
      {
        id: interaction.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory
        ]
      }
    ];

    if (CONFIG.cargoStaff) {
      permissoes.push({
        id: CONFIG.cargoStaff,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory
        ]
      });
    }

    const canal = await guild.channels.create({
      name: `ticket-${interaction.user.username}`.toLowerCase(),
      type: ChannelType.GuildText,
      parent: CONFIG.categoria || undefined,
      permissionOverwrites: permissoes
    });

    const fechar = new ButtonBuilder()
      .setCustomId("fechar_ticket")
      .setLabel("Fechar Ticket")
      .setEmoji("🔒")
      .setStyle(ButtonStyle.Danger);

    const linha = new ActionRowBuilder()
      .addComponents(fechar);

    const embed = new EmbedBuilder()
      .setTitle("🎫 Ticket aberto")
      .setDescription(
        `Olá ${interaction.user}!\n\n` +
        `Expl
