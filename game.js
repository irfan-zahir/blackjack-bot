import * as discord from 'discord.js'

const emoji = {
    hit: '797124126237524009',
    stand: '797139077844434964',
    dd: '797139077777457233'
}

const cards = [ 
    {card: 'A', value: 11}, {card: '2', value: 2},
    {card: '3', value: 3}, {card: '4', value: 4},
    {card: '5', value: 5}, {card: '6', value: 6},
    {card: '7', value: 7}, {card: '8', value: 8},
    {card: '9', value: 9}, {card: '10', value: 10},
    {card: 'J', value: 10}, {card: 'Q', value: 10},
    {card: 'K', value: 10}
]

const suits = ['diamonds', 'clubs', 'hearts', 'spades']

export default class Blackjack{
    constructor(player, bet){
        this.player = player
        this.bet = bet
        this.playerHand = []
        this.dealerHand = []
        this.deck = []
        this.playerMove = false
        this.dealerMove = false
        this.gameEnd = false
        this.gameResult = ''
        this.winner = ''
    }

    shuffledecks(){
        var virDeck = []
        for(var i = 0; i < suits.length; i++){
            for(var j = 0; j < cards.length; j++){
                let card = {card: cards[j], suit: suits[i]}
                virDeck.push(card)
            }
        }

        for(var i = virDeck.length -1 ; i > 0; i--){
            const j = Math.floor(Math.random() * (i + 1));
            [virDeck[i], virDeck[j]] = [virDeck[j], virDeck[i]];
        }

        this.deck = virDeck
    }

    dealing_card(){
        return this.deck.pop()
    }

    async initialize(message){
        this.shuffledecks()
        if(!this.playerMove){
            this.playerMove = true
            this.dealerHand.push(this.dealing_card())
            this.playerHand.push(this.dealing_card())
            this.dealerHand.push(this.dealing_card())
            this.playerHand.push(this.dealing_card())

            var playerCards = [], dealerCards = [], playerVal = 0, dealerVal = 0
            this.playerHand.forEach(card=>{
                playerCards.push(`${card.card.card} of ${card.suit}`)
                var index = cards.findIndex(val => val === card.card)
                playerVal += parseInt(cards[index].value)
            })

            dealerCards.push(`${this.dealerHand[0].card.card} of ${this.dealerHand[0].suit}`)
            dealerVal += parseInt(this.dealerHand[0].card.value)

            this.check_blackjack()
            console.log('initialize: ' + this.gameResult)
            var display = this.game_result()

            var sent = await message.channel.send(display)
            
            sent.react(emoji.hit)
            sent.react(emoji.stand)
            sent.react(emoji.dd)

            return sent
        }
    }


    check_blackjack(){
        var pcard1 = this.playerHand[0].card , pcard2 = this.playerHand[1].card
        if(pcard1.card == 'J' ||pcard1.card == 'Q' ||pcard1.card == 'K'){
            if(pcard2.card == 'J' ||pcard2.card == 'Q' ||pcard2.card == 'K'){
                this.playerMove = false
                this.dealerMove = false
                this.gameEnd = true
                this.winner = 'player'
                this.gameResult = 'blackjack'//auto win
            }
        }

        var dcard1 = this.dealerHand[0].card , dcard2 = this.dealerHand[1].card
        if(dcard1.card == 'J' ||dcard1.card == 'Q' ||dcard1.card == 'K'){
            if(dcard2.card == 'J' ||dcard2.card == 'Q' ||dcard2.card == 'K'){
                this.playerMove = false
                this.dealerMove = false
                this.gameEnd = true
                this.winner = 'dealer'
                this.gameResult = 'dealer blackjack' //auto win
            }
        }
    }

    update_output(){

        var playerCards = [], dealerCards = [], playerVal = 0, dealerVal = 0
        this.playerHand.forEach(card=>{
            playerCards.push(`${card.card.card} of ${card.suit}`)
            var index = cards.findIndex(val => val === card.card)
            playerVal += parseInt(cards[index].value)
        })

        if(!this.playerMove){
            this.dealerHand.forEach(card=>{
                dealerCards.push(`${card.card.card} of ${card.suit}`)
                var index = cards.findIndex(val => val === card.card)
                dealerVal += parseInt(cards[index].value)
            })
        }else{
            dealerCards.push(`${this.dealerHand[0].card.card} of ${this.dealerHand[0].suit}`)
            var index = cards.findIndex(val => val === this.dealerHand[0].card)
            dealerVal += parseInt(cards[index].value)
        }

        return this.game_result()
    }

    player_count(){

        var playerTotal = 0

        var playerAces = 0
        
        if(this.playerHand.find(card => card.card.card === 'A')!=undefined) playerAces = this.playerHand.find(card => card.card.card === 'A').length
        
        this.playerHand.forEach(card=>{
            playerTotal += parseInt(card.card.value) 
        })

        if(playerTotal > 21 && playerAces > 0){ // soft ace
            playerTotal = playerTotal - (10*playerAces)
            console.log('player soft ace')
        }

        return playerTotal
    }

    dealer_count(){
        var dealerAces = 0, dealerTotal = 0

        if(this.dealerHand.find(card => card.card.card === 'A')!=undefined) dealerAces = this.dealerHand.find(card => card.card.card === 'A').length

        this.dealerHand.forEach(card=>{
            dealerTotal += parseInt(card.card.value)
        })

        if(dealerTotal > 21 && dealerAces > 0){
            dealerTotal = dealerTotal - (10*dealerAces)
            console.log('dealer soft ace' + dealerTotal)
        }
        console.log('count dealer ' + dealerTotal)

        return dealerTotal
    }
    
    count_card(playerTotal, dealerTotal){
        console.log(`counting card: ${playerTotal} || ${dealerTotal}`)

        if(dealerTotal > 21){
            this.playerMove = false
            this.dealerMove = false
            this.gameEnd = true
            this.gameResult = 'dealer busted'
            this.winner = 'player'
        }

        if(playerTotal > 21){
            this.playerMove = false
            this.dealerMove = false
            this.gameEnd = true
            this.gameResult = 'player busted'
            this.winner = 'dealer'
        }

        if(!this.dealerMove && !this.playerMove && !this.gameResult && !this.winner){
            console.log('stand masuk sini septatutnya')
            if(playerTotal == dealerTotal){
                this.gameResult = 'deuce'
            }else if(dealerTotal > playerTotal){
                this.gameResult = 'dealer win'
                this.winner = 'dealer'
            }else if(playerTotal > dealerTotal){
                this.gameResult = 'player win'
                this.winner = 'player'
            }
            this.gameEnd = true
        }
    }

    dealer_move(){
        console.log('dealer move')
        var dealerTotal = 0
        this.dealerHand.forEach(card=>{
            dealerTotal += card.card.value
        })
        if(this.dealerMove){
            while(dealerTotal < 17){

                var dealerAces = 0
                if(this.playerHand.find(card => card.card.card === 'A')!=undefined) dealerAces = this.playerHand.find(card => card.card.card === 'A').length

                this.dealerHand.forEach(card=>{
                    dealerTotal += parseInt(card.card.value)
                })
    
                if(dealerTotal > 21 && dealerAces > 0){
                    dealerTotal = dealerTotal - (10*dealerAces)
                }
                this.dealerHand.push(this.dealing_card()) 
            }
            this.dealerMove = false
            this.count_card(this.player_count(), this.dealer_count())
        }
    }

    player_action(reaction){
        switch(reaction){
            case 'hit':
                this.action_hit()
            break;
            case 'double':
                this.action_double()
            break;
            case 'stand':
                this.action_stand()
            break;
        }
    }

    action_stand(){
        console.log('stand=========================')
        this.playerMove = false
        this.dealerMove = true
    }

    action_double(){
        console.log('double')
        this.playerHand.push(this.deck.pop())
        this.playerMove = false
        this.dealerMove = true
    }
    
    action_hit(){
        this.playerHand.push(this.deck.pop())
        console.log('hit========================')
    }

    game_result(){
        var embedded
        var playerCards = [], dealerCards = [], playerVal = 0, dealerVal = 0, dealerAces = 0, playerAces = 0
        this.count_card(this.player_count(), this.dealer_count())

        this.playerHand.forEach(card=>{
            playerCards.push(`${card.card.card} of ${card.suit}`)
            
            playerVal += parseInt(card.card.value)
            if(playerVal > 21 && dealerAces > 0){
                playerVal = playerVal - (10*playerAces)
            }
        })

        if(!this.playerMove){
            this.dealerHand.forEach(card=>{
                dealerCards.push(`${card.card.card} of ${card.suit}`)
                var index = cards.findIndex(val => val === card.card)

                dealerVal += parseInt(card.card.value)
                if(dealerVal > 21 && dealerAces > 0){
                    dealerVal = dealerVal - (10*dealerAces)
                }
            })
        }else{
            dealerCards.push(`${this.dealerHand[0].card.card} of ${this.dealerHand[0].suit}`)
            var index = cards.findIndex(val => val === this.dealerHand[0].card)
            dealerVal += parseInt(cards[index].value)
        }
        
        console.log('game_result: ' + this.gameResult)
        switch(this.gameResult){
            case 'blackjack':
                embedded = new discord.MessageEmbed()
                .setTitle(`${this.player.username} WIN!`)
                .setDescription(
                    '```' + 
                    'Dealer hand: ' + dealerCards.toString().replace(/,/g, ' and ') +
                        '\n\n\tBlackjack xDDx\n\n'+
                    'Player hand: ' + playerCards.toString().replace(/,/g, ' and ') +
                    `\n\n${this.player.username} get a BLACKJACK! PogChamps!`
                    + '```'
                )
                .setFooter('feelsbadman')
                .setColor('#ef4f4f')
            break;
            case 'dealer blackjack':
                embedded = new discord.MessageEmbed()
                .setTitle(`${this.player.username} LOSE!`)
                .setDescription(
                    '```' + 
                    'Dealer hand: ' + dealerCards.toString().replace(/,/g, ' and ') +
                        '\n\n\tBlackjack xDDx\n\n'+
                    'Player hand: ' + playerCards.toString().replace(/,/g, ' and ') +
                    `\n\nRIP Dealer BLACKJACK! ${this.player.username} lose!`
                    + '```'
                )
                .setFooter('feelsbadman')
                .setColor('#ef4f4f')
            break;
            case 'player busted':
                embedded = new discord.MessageEmbed()
                .setTitle(`${this.player.username} LOSE!`)
                .setDescription(
                    '```' + 
                    'Dealer hand: ' + dealerCards.toString().replace(/,/g, ' and ') +
                        '\n\n\tBlackjack xDDx\n\n'+
                    'Player hand: ' + playerCards.toString().replace(/,/g, ' and ') +
                    `\n\n${this.player.username} lose! Sadge Busted. ${this.player.username} has ${playerVal}`
                    + '```'
                )
                .setFooter('feelsbadman')
                .setColor('#ef4f4f')
            break;
            case 'dealer busted':
                embedded = new discord.MessageEmbed()
                .setTitle(`${this.player.username} WIN!`)
                .setDescription(
                    '```' + 
                    'Dealer hand: ' + dealerCards.toString().replace(/,/g, ' and ') +
                        '\n\n\tBlackjack xDDx\n\n'+
                    'Player hand: ' + playerCards.toString().replace(/,/g, ' and ') +
                    `\n\n${this.player.username} win! Sadge Dealer busted. Dealer has ${dealerVal}`
                    + '```'
                )
                .setFooter('feelsbadman')
                .setColor('#ef4f4f')
            break;
            case 'player win':
                embedded = new discord.MessageEmbed()
                .setTitle(`${this.player.username} WIN!`)
                .setDescription(
                    '```' + 
                    'Dealer hand: ' + dealerCards.toString().replace(/,/g, ' and ') +
                        '\n\n\tBlackjack xDDx\n\n'+
                    'Player hand: ' + playerCards.toString().replace(/,/g, ' and ') +
                    `\n\n${this.player.username} win! Dealer Maketa! ${this.player.username} has ${playerVal} while Dealer has ${dealerVal}`
                    + '```'
                )
                .setFooter('feelsbadman')
                .setColor('#ef4f4f')
            break;
            case 'dealer win':
                embedded = new discord.MessageEmbed()
                .setTitle(`${this.player.username} LOSE!`)
                .setDescription(
                    '```' + 
                    'Dealer hand: ' + dealerCards.toString().replace(/,/g, ' and ') +
                        '\n\n\tBlackjack xDDx\n\n'+
                    'Player hand: ' + playerCards.toString().replace(/,/g, ' and ') +
                    `\n\n${this.player.username} lose! Maketa! Dealer has ${dealerVal} while ${this.player.username} has ${playerVal}`
                    + '```'
                )
                .setFooter('feelsbadman')
                .setColor('#ef4f4f')
            break;
            case 'deuce':
                embedded = new discord.MessageEmbed()
                .setTitle(this.player.username)
                .setDescription(
                    '```' + 
                    'Dealer hand: ' + dealerCards.toString().replace(/,/g, ' and ') +
                        '\n\n\tBlackjack xDDx\n\n'+
                    'Player hand: ' + playerCards.toString().replace(/,/g, ' and ') +
                    '\n\nPush! Both Dealer and ' + this.player.username + ' have same total value'
                    + '```'
                )
                .setFooter('feelsbadman')
                .setColor('#ef4f4f')
            break;
            default:
                embedded = new discord.MessageEmbed()
                .setTitle(this.player.username)
                .setDescription(
                    '```' + 
                    'Dealer hand: ' + dealerCards.toString().replace(/,/g, ' and ') +
                        '\n\n\tBlackjack xDDx\n\n'+
                    'Player hand: ' + playerCards.toString().replace(/,/g, ' and ')
                    + '```'
                )
                .setFooter('feelsbadman')
                .setColor('#ef4f4f')
            break;
        }

        return embedded
    }
    
    send_gameResult(sent){
        var embedded = this.game_result()
        sent.edit(embedded)
    }
}