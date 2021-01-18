import * as discord from 'discord.js'
import claim from './commands/claim.js'
import Blackjack from './game.js'

const TOKEN = 'Nzk2NDMzNDgxMjczMTgwMjAz.X_X2eg.-O9Q0U_YPgfOBgEgxd4PaObO6_c'

const emoji = {
    hit: '797124126237524009',
    stand: '797139077844434964',
    dd: '797139077777457233'
}

const bot = new discord.Client()

bot.login(TOKEN).then(()=>{
    console.log('blackjack is online')
    bot.user.setStatus(`In development 🙈 `)
})

var players = []

bot.on('message', async message=>{
    
    if(message.author.bot) return
    if(!message.content.startsWith('!')) return

    var player = players.find(player => player.username === message.author.username)
    
    if(!player){
        player = {
            id : message.author.id,
            username: message.author.username,
            claimed: false,
            rgame: false,
            chips: 100,
            win: 0,
            lose: 0,
        }
        
        players.push(player)
    }

    const commandBody = message.content.slice(1); 
    const args = commandBody.split(' '); 
    const command = args.shift().toLowerCase();
    const bet = args[0]

    if(command === 'blackjack' || command === 'bj'){
        
        //nak kene setting custom dealing card supaya player tak selalu menang
        if(!player.rgame){
            if(!bet){
                message.channel.send('Beep boop! Berapa nak bet? !blackjack [bet]')
                return
            }

            if(bet > player.chips){
                message.channel.send(`Beep boop! ${player.username} cuma ada ${player.chips} chips je`)
                return
            }
    
            var game = new Blackjack(player, bet)
            var sent = await game.initialize(message)
            player.rgame = game

            var reaction
            while(game.playerMove){

                var getReact = await sent.awaitReactions((react, user)=> user.id === player.id, {max: 1, maxUsers: 1})
                var reactions = getReact.array()[0].emoji.id
    
                switch(reactions){
                    case emoji.hit:
                        reaction = 'hit'
                    break;
                    case emoji.dd:
                        reaction = 'double'
                    break;
                    case emoji.stand:
                        reaction = 'stand'
                    break;
                }
    
                game.player_action(reaction)
                sent.reactions.resolve(reactions).users.remove(player.id)
                sent.edit(game.update_output())
            }
            
            
            console.log('player end')
            game.dealer_move()
            game.send_gameResult(sent)

            if(game.winner == 'player'){
                console.log('player win')
                player.chips += parseInt(bet)
                player.win++
                player.rgame = undefined
            }else if(game.winner == 'dealer'){
                console.log('player lose')
                player.chips -= parseInt(bet)
                player.lose++
                player.rgame = undefined
            }else{
                console.log('default')
            }

        }else{
            const embeded = player.rgame.update_output()
            
            message.channel.send('Habiskan game tadi dulu bos!')
            var sent = await message.channel.send(embeded)
            player.rgame = sent.id
            sent.react(emoji.hit)
            sent.react(emoji.stand)
            sent.react(emoji.dd)
        }
    }

    // if(command === 'claim') claim(player, message)
    if(command == 'chips'){
        const chips = new discord.MessageEmbed()
            .setTitle(player.username)
            .setDescription(
                '```'+`Total chips: ${player.chips}\nHarini punya chips ${player.claimed ? 'dah claim': 'belum claim lagi'}`+
                '```'
            )
            .setFooter('Enjoy main blackjack 💋')
        message.channel.send(chips)
    }
})