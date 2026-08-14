const {
  Client,
  GatewayIntentBits,
  PermissionFlagsBits,
  SlashCommandBuilder
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const comandos = [
  new SlashCommandBuilder()
    .setName("banir")
    .setDescription("Bane um membro do servidor.")
    .addUserOption(opcao =>
      opcao
        .setName("usuario")
        .setDescription("Usuário que será banido.")
        .setRequired(true)
    )
    .addStringOption(opcao =>
      opcao
        .setName("motivo")
        .setDescription("Motivo do banimento.")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
];

client.once("ready", async () => {
  console.log(`Carl Cat conectado como ${client.user.tag}`);

  for (const [id, servidor] of client.guilds.cache) {
    await servidor.commands.set(comandos);
  }

  console.log("Comando /banir registrado!");
});

client.on("interactionCreate", async interacao => {
  if (!interacao.isChatInputCommand()) return;

  if (interacao.commandName === "banir") {
    if (!interacao.memberPermissions.has(PermissionFlagsBits.BanMembers)) {
      return interacao.reply({
        content: "❌ Você não tem permissão para banir membros.",
        ephemeral: true
      });
    }

    const usuario = interacao.options.getUser("usuario");
    const motivo =
      interacao.options.getString("motivo") || "Nenhum motivo informado.";

    const membro = await interacao.guild.members
      .fetch(usuario.id)
      .catch(() => null);

    if (!membro) {
      return interacao.reply({
        content: "❌ Não encontrei esse membro no servidor.",
        ephemeral: true
      });
    }

    if (!membro.bannable) {
      return interacao.reply({
        content: "❌ Não posso banir esse membro. Verifique a hierarquia de cargos e minhas permissões.",
        ephemeral: true
      });
    }

    try {
      await membro.ban({ reason: motivo });

      await interacao.reply(
        `🔨 **${usuario.tag}** foi banido com sucesso.\n📝 Motivo: **${motivo}**`
      );
    } catch (erro) {
      console.error(erro
