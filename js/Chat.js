/* 
- stocker la conversation dans une liste, comme ca tu peus faire une ref à ce qui a été dit avant
- this.context: là que tu poses le cadre de la conversation 
- hasBrowserSupport: initialisation du speach to text
- tu peux changer les voix quand tu va dans la console tu y trouves les différents voix
- fetch: pour recevoir et envoyé des messages sur internet
- onboundary: envoi un évènement à chaque fois qu'un nouveau mot a été dit 

- le seul truc à changer dans la classe Chat, c'est le context!!!
 */

import Config from "./Config.js";
import Speech from "speak-tts";
import EventEmitter from "@onemorestudio/eventemitterjs";
export default class Chat extends EventEmitter {
  constructor() {
    super();
    this.API_URL = "https://api.openai.com/v1/chat/completions";
    this.API_KEY = Config.OPEN_AI_KEY;
    this.messages = [];
    this.context =
      "Tu joues le rôle d’un personnage qui est très gentil, et tu me poses des questions sur ma journée. au fur et à mesure que tu me poses des questions, tu commences à jouer le rôle d’un personnage qui devient de plus en plus désagréable et qui ne porte pas d’importance à mes réponses. Basé sur mes réponses, tu me poses d’autres questions. Tu fais des question réponses. Commence par me poser une question pour me demander ce que j’ai fais durant la journée. N’oublies pas que tu joues un rôle, tu n’as pas besoin de t’excuser pour ton comportement désagréable. Et tu n’as pas besoin de préciser que tu joues un rôle.";
    this.speech = new Speech(); // will throw an exception if not browser supported
    if (this.speech.hasBrowserSupport()) {
      // returns a boolean
      console.log("speech synthesis supported", this.speech);
    }

    this.speech
      .init({
        volume: 1,
        lang: "fr-FR",
        rate: 0.6,
        pitch: 1,
        voice: "Marie",
        splitSentences: true,
        listeners: {
          onvoiceschanged: (voices) => {
            console.log("Event voiceschanged", voices);
            // this.speech.voice = "Flo (français (France))";
          },
        },
      })
      .then((data) => {
        // The "data" object contains the list of available voices and the voice synthesis params
        console.log("Speech is ready, voices are available", data);
        // this.speech.voice = data[8];
      })
      .then(() => {
        console.log("Success !");
        //
        // this.call(this.context);
      })
      .catch((e) => {
        console.error("An error occured while initializing : ", e);
      });

    // this.init();
  }
  async init() {
    // on invente un contexte pour le chat
  }

  async call(userMessage) {
    this.messages.push({
      role: "user",
      content: userMessage,
    });
    console.log("config", Config.TEXT_MODEL);
    console.log("userMessage", userMessage);
    try {
      console.log("Send message to OpenAI API");
      // Fetch the response from the OpenAI API with the signal from AbortController
      const response = await fetch(this.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.API_KEY}`,
        },
        body: JSON.stringify({
          model: Config.TEXT_MODEL, // "gpt-3.5-turbo",
          messages: this.messages,
        }),
      });

      const data = await response.json();
      // ici on attends la réponse de CHAT GPT
      console.log(data.choices[0].message.content);

      // on peut envoyer la réponse à l'app dans l'idée de voir si on pourrait générer une image
      this.emit("gpt_response", [data.choices[0].message.content]);
      this.activeString = "";
      //on peut faire parler le bot
      this.speech
        .speak({
          text: data.choices[0].message.content,
          listeners: {
            onstart: () => {
              // console.log("Start utterance");
            },
            onend: () => {
              // console.log("End utterance");
            },
            onresume: () => {
              // console.log("Resume utterance");
            },
            onboundary: (event) => {
              this.extractWord(event);
            },
          },
        })
        .then(() => {
          // console.log("This is the end my friend!");
          this.emit("speechEnd", [data]);
        });
    } catch (error) {
      console.error("Error:", error);
      resultText.innerText = "Error occurred while generating.";
    }
  }

  extractWord(event) {
    const index = event.charIndex;
    const word = this.getWordAt(event.target.text, index);
    this.emit("word", [word]);
  }

  // Get the word of a string given the string and index
  getWordAt(str, pos) {
    // Perform type conversions.
    str = String(str);
    pos = Number(pos) >>> 0;

    // Search for the word's beginning and end.
    let left = str.slice(0, pos + 1).search(/\S+$/);
    let right = str.slice(pos).search(/\s/);

    // The last word in the string is a special case.
    if (right < 0) {
      return str.slice(left);
    }

    // Return the word, using the located bounds to extract it from the string.
    return str.slice(left, right + pos);
  }
}

// /*
// - stocker la conversation dans une liste, comme ca tu peus faire une ref à ce qui a été dit avant
// - this.context: là que tu poses le cadre de la conversation
// - hasBrowserSupport: initialisation du speach to text
// - tu peux changer les voix quand tu va dans la console tu y trouves les différents voix
// - fetch: pour recevoir et envoyé des messages sur internet
// - onboundary: envoi un évènement à chaque fois qu'un nouveau mot a été dit

// - le seul truc à changer dans la classe Chat, c'est le context!!!
//  */

// import Config from "./Config.js";
// import Speech from "speak-tts";
// import EventEmitter from "@onemorestudio/eventemitterjs";
// export default class Chat extends EventEmitter {
//   constructor() {
//     super();
//     this.API_URL = "https://api.openai.com/v1/chat/completions";
//     this.API_KEY = Config.OPEN_AI_KEY;
//     this.messages = [];
//     this.context =
//       "Tu joues le rôle d’un personnage qui est très gentil, et tu me poses des questions sur ma journée. au fur et à mesure que tu me poses des questions, tu commences à jouer le rôle d’un personnage qui devient de plus en plus désagréable et qui ne porte pas d’importance à mes réponses. Basé sur mes réponses, tu me poses d’autres questions. Tu fais des question réponses. Commence par me poser une question pour me demander si j’ai passé une bonne journée. N’oublies pas que tu joues un rôle, tu n’as pas besoin de t’excuser pour ton comportement désagréable. Et tu n’as pas besoin de préciser que tu joues un rôle.";

//     this.speech = new Speech(); // will throw an exception if not browser supported
//     if (this.speech.hasBrowserSupport()) {
//       // returns a boolean
//       console.log("speech synthesis supported");
//     }
//     this.speech
//       .init({
//         volume: 1,
//         lang: "fr-FR",
//         rate: 1,
//         pitch: 1,
//         voice: "Thomas",
//         splitSentences: true,
//         listeners: {
//           onvoiceschanged: (voices) => {
//             console.log("Event voiceschanged", voices);
//           },
//         },
//       })
//       .then((data) => {
//         // The "data" object contains the list of available voices and the voice synthesis params
//         console.log("Speech is ready, voices are available", data);
//         // this.speech.voice = "Eddy (anglais (États-Unis))";
//       })
//       .then(() => {
//         console.log("Success !");
//         //
//         // this.call(this.context);
//       })
//       .catch((e) => {
//         console.error("An error occured while initializing : ", e);
//       });

//     // this.init();
//   }
//   async init() {
//     // on invente un contexte pour le chat
//   }

//   async call(userMessage) {
//     this.messages.push({
//       role: "user",
//       content: userMessage,
//     });
//     console.log("config", Config.TEXT_MODEL);
//     console.log("userMessage", userMessage);
//     try {
//       console.log("Send message to OpenAI API");
//       // Fetch the response from the OpenAI API with the signal from AbortController
//       const response = await fetch(this.API_URL, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${this.API_KEY}`,
//         },
//         body: JSON.stringify({
//           model: Config.TEXT_MODEL, // "gpt-3.5-turbo",
//           messages: this.messages,
//         }),
//       });

//       const data = await response.json();
//       // ici on attends la réponse de CHAT GPT
//       console.log(data.choices[0].message.content);

//       // on peut envoyer la réponse à l'app dans l'idée de voir si on pourrait générer une image
//       this.emit("gpt_response", [data.choices[0].message.content]);
//       this.activeString = "";
//       //on peut faire parler le bot
//       // console.log("just before speech", this.speech);
//       // this.emit("word", ["test olivia"]);
//       // this.speech.speak({ text: "bonjour olivia" });
//       this.speech
//         .speak({
//           text: data.choices[0].message.content,
//           listeners: {
//             onstart: () => {
//               // console.log("Start utterance");
//             },
//             onend: () => {
//               // console.log("End utterance");
//             },
//             onresume: () => {
//               // console.log("Resume utterance");
//             },
//             onboundary: (event) => {
//               this.extractWord(event);
//             },
//           },
//         })
//         .then(() => {
//           // console.log("This is the end my friend!");
//           this.emit("speechEnd", [data]);
//         });
//     } catch (error) {
//       console.error("Error:", error);
//       resultText.innerText = "Error occurred while generating.";
//     }
//   }

//   extractWord(event) {
//     console.log("extract word");
//     const index = event.charIndex;
//     const word = this.getWordAt(event.target.text, index);
//     this.emit("word", [word]);
//   }

//   // Get the word of a string given the string and index
//   getWordAt(str, pos) {
//     // Perform type conversions.
//     str = String(str);
//     pos = Number(pos) >>> 0;

//     // Search for the word's beginning and end.
//     let left = str.slice(0, pos + 1).search(/\S+$/);
//     let right = str.slice(pos).search(/\s/);

//     // The last word in the string is a special case.
//     if (right < 0) {
//       return str.slice(left);
//     }

//     // Return the word, using the located bounds to extract it from the string.
//     return str.slice(left, right + pos);
//   }
// }
