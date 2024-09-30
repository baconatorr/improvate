import { initializeApp } from 'firebase/app'
import {
  getFirestore, collection, getDocs, addDoc, hasOwnProperty
} from 'firebase/firestore'

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

//add story
const addStoryForm = document.querySelector('.add')
if(addStoryForm){
  addStoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    //create a document for the chain of stories
    addDoc(storiesRef, {
      title: addStoryForm.title.value,
      //string splitting method from StackOverflow https://stackoverflow.com/questions/10346722/how-to-split-a-string-by-white-space-or-comma
      genre: addStoryForm.genre.value.split(/[ ,]+/),
      time: new Date(),
      upvotes: 0
    })
    .then((docRef) => {
      //create the collections
      let id = docRef.id;
      const currentSentencesRef = collection(db, 'stories', id, "currentSentences");
      const newSentencesRef = collection(db, 'stories', id, "newSentences");
      addDoc(newSentencesRef, {
        filler: null
      });
      addDoc(currentSentencesRef, {
        sentence: addStoryForm.sentence.value,
        time: new Date()
      })
      .then(() => {
        //open the story
        console.log('opening story link');
        openStoryLink(id);
      })
    })
  })
}

//set the link
function openStoryLink(id){
  location.href = `story.html?storyId=${id}`;
}

//continue flow between redirect and opening
document.addEventListener("DOMContentLoaded", () => {
  const storyId = fetchIdFromLink(); // Fetch the story ID from the URL
  if (storyId) {
    displayStory(storyId); // Call displayStory with the fetched ID
  } else {
    console.error("No story ID found in the URL.");
  }
});

//fetch id from link
function fetchIdFromLink(){
  console.log('fetching');
  const params = new URLSearchParams(window.location.search);
  return params.get('storyId');
}

function displayStory(id){
  console.log('starting to open');
  const currentSentencesRef = collection(db, 'stories', id, "currentSentences");
  console.log('starting to open');

  //create the cards
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