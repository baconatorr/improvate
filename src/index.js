import { initializeApp } from 'firebase/app'
import {
  getFirestore, collection, getDocs, addDoc, doc, getDoc, Timestamp, updateDoc, increment
} from 'firebase/firestore'

import Typewriter from '../node_modules/t-writer.js/dist/t-writer.js'

const firebaseConfig = {
  apiKey: "AIzaSyA-bCgHWMR6mJ80jwu7EiOW8jNmNF-Kkqs",
  authDomain: "improvate-402e6.firebaseapp.com",
  projectId: "improvate-402e6",
  storageBucket: "improvate-402e6.appspot.com",
  messagingSenderId: "75404699953",
  appId: "1:75404699953:web:25f3096beba4d826916810",
  measurementId: "G-QXFCSF2QB2"
};

//init firebase app
initializeApp(firebaseConfig);

//init services
const db = getFirestore()

//collection ref
const storiesRef = collection(db, 'stories');

//init function object
const openStoryPage = {
  id: null,
  currentSentencesRef: null,
  newSentencesRef: null,
  storyRef: null,
  updateReferences() {
    if (this.id) {
      this.currentSentencesRef = collection(db, 'stories', this.id, "currentSentences");
      this.newSentencesRef = collection(db, 'stories', this.id, "newSentences");
      this.storyRef = doc(db, 'stories', this.id);
    } else {
      console.error("Story ID is not set.");
    }
  },
  openPage: {
    title: null,
    time: null,
    genre: null,
    upvotes: null,
    user: null,
    views: null,
    openStoryPageLink(){
      location.href = `story.html?storyId=${openStoryPage.id}`;
    },
    fetchIdFromLink(){
      console.log('Fetching Id from the Link');
      const params = new URLSearchParams(window.location.search);
      return params.get('storyId');
    },
    fetchStoryInfo(){
      return getDoc(openStoryPage.storyRef)
        .then((snapshot) => {
          if(snapshot.exists()){
            const data = snapshot.data();
            openStoryPage.openPage.title = data["title"];
            openStoryPage.openPage.time = data["time"];
            openStoryPage.openPage.genre = data["genre"];
            openStoryPage.openPage.upvotes = data["upvotes"];
            openStoryPage.openPage.user = data["user"];
            openStoryPage.openPage.views = data["views"];
            console.log("Fetch Story Info function completed");
          } else{
            return;
          }
        })
    },
    displayGeneralInfo(){
      //update the references
      openStoryPage.updateReferences();
      const titleText = document.querySelector(".title-text");
      //set the title
      titleText.innerText = this.title;
      //set the genre
      const genre = this.genre;
      genre.forEach((ele) => {
        const tag = document.createElement("div");
        tag.className = "tag";
        tag.innerText = ele;
        const tagContainer = document.querySelector('.tag-container');
        tagContainer.append(tag);
      })
      //set the user
      const userText = document.querySelector(".user-text");
      userText.innerText = this.user;
      //set the time
      const timeText = document.querySelector(".time-text");
      const time = this.time
      timeText.innerText = formatDate(this.time);
      //set the upvotes
      const upvoteText = document.querySelector(".upvotes-text");
      upvoteText.innerText = this.upvotes;
      //update the views
      const viewsRef = doc(db, 'stories', openStoryPage.id);
      updateDoc(viewsRef, {
        "views": increment(1)
      });
      //set the views
      const viewsText = document.querySelector(".views-text");
      viewsText.innerText = this.views;
    },
  },
}

//--Load Story when clicked or created--

//Step 0: Upload created story to database
const addStoryForm = document.querySelector('.add')
if(addStoryForm){
  addStoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    //create a document for the chain of stories
    let date = new Date()
    addDoc(storiesRef, {
      title: addStoryForm.title.value,
      //string splitting method from StackOverflow https://stackoverflow.com/questions/10346722/how-to-split-a-string-by-white-space-or-comma
      genre: addStoryForm.genre.value.split(/[ ,]+/),
      time: Timestamp.fromDate(date),
      upvotes: 0,
      user: "masonator"
    })
    .then((docRef) => {
      //create the collections
      openStoryPage.id = docRef.id;
      openStoryPage.updateReferences()
      addDoc(openStoryPage.newSentencesRef, {
        filler: null
      });
      addDoc(openStoryPage.currentSentencesRef, {
        sentence: addStoryForm.sentence.value,
        time: new Date(),
        user: "masonator"
      })
      .then(() => {
        //open the story
        openStoryPage.openPage.openStoryPageLink();
      })
    })
  })
}

//Step 1: When page is loaded, fetch and display the story info
document.addEventListener("DOMContentLoaded", () => {
  console.log("Story Page Opened")
  const storyId = openStoryPage.openPage.fetchIdFromLink(); // Fetch the story ID from the URL
  console.log("Fetched Story Id: " + storyId);
  openStoryPage.id = storyId;
  openStoryPage.updateReferences();
  if (storyId) {
    console.log("Calling fetchStoryInfo function");
    openStoryPage.openPage.fetchStoryInfo()
      .then(() => {
        console.log("Calling displayGeneralInfo function");
        openStoryPage.openPage.displayGeneralInfo();
      })
  } else {
    console.error("No story ID found in the URL.");
  }
});

function displayStory(){
  // console.log('starting to open');
  // //int references
  // const storyRef = doc(db, 'stories', id)
  // const currentSentencesRef = collection(db, 'stories', id, "currentSentences");
  // const newSentencesRef = collection(db, 'stories', id, "newSentences");

  //load general info about story
  // getDocs(storyRef)
  //   .then((snapshot) => {
  //     if(snapshot.exists()){
  //       const data = snapshot.data();
  //       const title = data["title"];
  //       const time = data["time"];
  //       const genre = data["genre"];
  //       const upvotes = data["upvotes"];
  //     } else{
  //       return;
  //     }
  //   })


  //load the general info onto the page
  const titleText = document.querySelector(".title-text");
  titleText.innerText = title;

  //create the cards for the already existing sentences
  getDocs(currentSentencesRef)
    .then((snapshot) => {
      snapshot.docs.forEach((doc) => {
        //create the card div
        const card = document.createElement('div');
        card.className = "current-sentence-card";
        //create the sentence div
        const sentence = document.createElement('div');
        sentence.className = "current-sentence-card-sentence-text";
        //fetch the sentence from db
        const data = doc.data();
        sentence.innerText = data["sentence"];

        //append sentence to card
        card.append(sentence);
        //append card to card container
        const container = document.querySelector(".currentSentencesContainer");
        container.append(card);
        if (container) {
          container.appendChild(card);
        } else {
          console.error("Container for current sentences not found");
        }
      })
    })

}

//date to am pm
function formatDate(timestamp) {
  const date = timestamp.toDate(); // Convert Firestore Timestamp to JavaScript Date
  const options = {
    year: 'numeric',
    month: 'long', // e.g., 'October'
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true // Use 12-hour format
  };
  return date.toLocaleString('en-US', options); // Format as desired
}

//typewriter effect
document.addEventListener("DOMContentLoaded", () => {
  const target = document.querySelector('.tw');
  if (target) {
    const options = {
      loop: true,
      typeSpeed: 90,
      deleteSpeed: 60,
      animateCursor: true,
      typeColor: "black"
    };

    const writer = new Typewriter(target, options);

    writer.strings(1000, 'community', 'workshop', 'narrative').start();
  } else {
    console.error("Target element for typewriter effect not found.");
  }
});