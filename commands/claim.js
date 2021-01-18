import discord from 'discord.js'

export default function claim(player, message){
    if(player.claimed) {
        message.channel.send(`${player.username}, you dah claim chips harini. Claim esok pulak ye. (Total chips: ${player.chips})`)
        return
    }

    player.claimed = true
    player.chips += 100
    const claim = new discord.MessageEmbed()
        .setTitle(player.username)
        .setDescription(
            ```
                ${player.username} dah claim 100 chips harini.
                Total chips: ${player.chips}
            ```
        )
        .setFooter('Enjoy main blackjack 💋')
    message.channel.send(claim)
}