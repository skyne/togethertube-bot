const WebSocket = require("ws");
const bot = require("togethertube-vote-bot");
const request = require('request');
const apiKey = "";
const listregex = new RegExp(/list=([A-Za-z0-9]*)/gm);
const room = "";

bot.generatePlaySessions(1)
  .then((sessions) => {

    const ws = new WebSocket(`wss://togethertube.com/websocket/rooms/${room}`, { headers: { "Cookie": sessions[0] } });

    ws.on("open", () => {
      ws.send('{"mid":"chatmessage","message":"Hello World!"}');
    });

    ws.on("message", (RawEvent) => {
      const event = JSON.parse(RawEvent);

      if (event.id && event.id === 'chatMessage') {

        if (event.data.message && event.data.message.startsWith('/add')) {
          const url = event.data.message.replace('/add ');

          const matches = listregex.exec(url);
          if (matches.length >= 2) {
            const videoId = matches[1];
            request(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet%2C+id&playlistId=${videoId}&key=${apiKey}`, (error, response, body) => {
              for (const item of JSON.parse(body).items) {


                //console.log(item.snippet.resourceId.videoId);
                const options = {
                  mediaServiceId: "youtube",
                  mediaId: item.snippet.resourceId.videoId
                }
                bot.addVote(room, sessions[0], options)
                  .then(() => {
                    console.log("Vote Added");
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              }
            });
          }

        }
      }
    });


  })
  .catch((err) => {
    console.error(err);
  });


