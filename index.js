const Discord = require("discord.js")
const fetch = require("node-fetch")
const keepAlive = require("./server")
const Database = require("@replit/database")

const db = new Database()
const client = new Discord.Client()

const negativeWords = ["sad","depressed","unhappy","angry","lonely","heartbroken","gloomy","disappointed","hopeless","grieved","lost","troubled","resigned","miserable","failed"]

const starterMotivations = ["You are a champion! You can climb over any obstacle","Cheer Up Buddy", "Stay Positive ++ That's the first step towards improving yourself", "You are loved<3", "Time changes everything","Everything is temporary so hang in there :)","Love Yourself","Might as well workout to get over the pain","You can do this","You are wanted :)"]

db.get("motivations").then(motivations => {
  if (!motivations || motivations.length < 1) {
    db.set("motivations", starterMotivations)
  }
})

db.get("responding").then(value => {
  if (value == null) {
    db.set("responding", true)
  }
})

function updateMotivations(motivatingMessage) {
  db.get("motivations").then(motivations => {
    motivations.push([motivatingMessage])
    db.set("motivations", motivations)
  })
}

function deleteMotivation(index) {
  db.get("motivations").then(motivations => {
    if (motivations.length > index) {
      motivations.splice(index, 1)
      db.set("motivations", motivations)
    }
  })
}

function getQuote() {
  return fetch("https://zenquotes.io/api/random")
  .then(res => {
    return res.json()
  })
  .then(data => {
    return data[0]["q"] + " —" + data[0]["a"]
  })
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on("message", msg => {
  if (msg.author.bot) return
  if (msg.content === "$inspire") {
    getQuote().then(quote => msg.channel.send(quote))
  }

  db.get("responding").then(responding =>{
    if (responding && negativeWords.some(word => msg.content.includes(word))) {
      db.get("motivations").then(motivations => {
        const motivation = motivations[Math.floor(Math.random()*motivations.length)]
          msg.reply(motivation)
      })
    }
  })


  if(msg.content.startsWith("$new")) {
    motivatingMessage = msg.content.split("$new ")[1]
    updateMotivations(motivatingMessage)
    msg.channel.send("New Motivating message added.")
  }

  if(msg.content.startsWith("$del")) {
    index = parseInt(msg.content.split("$del ")[1])
    deleteMotivation(index)
    msg.channel.send("Motivating message deleted.")
  }

  if(msg.content.startsWith("$list")) {
    db.get("motivations").then(motivations => {
      msg.channel.send(motivations)
    })
  }

  if(msg.content.startsWith("$responding")) {
    value = msg.content.split("$responding ")[1]

    if (value.toLowerCase() == "true") {
      db.set("responding", true)
      msg.channel.send("Responding is on.")
    } else {
      db.set("responding", false)
      msg.channel.send("Responding is off.")
    }
  }
})

keepAlive()
const mySecret = process.env['TOKEN']
client.login(mySecret)

