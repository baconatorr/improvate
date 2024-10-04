import { initializeApp } from 'firebase/app'
import {
  getFirestore, collection, getDocs, addDoc, doc, getDoc, Timestamp, updateDoc, increment
} from 'firebase/firestore'
import{
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
   onAuthStateChanged, setPersistence, browserSessionPersistence,
   updateProfile, signOut, getUser
} from 'firebase/auth'

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
const auth = getAuth()

// set session persistence to browser session
setPersistence(auth, browserSessionPersistence)
  .then(() => {
    console.log("Session persistence is set.");
  })
  .catch((error) => {
    console.error("Error setting session persistence:", error.message);
  });


//collection ref
const storiesRef = collection(db, 'stories');

//navigation function
window.navigate = function(loc){
    location.href = loc + ".html"
  }

document.addEventListener("DOMContentLoaded", () => {
//--homepage navigation based on auth--
  const auth = getAuth();
  console.log("Checking user authentication...");

  // monitor auth state
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("User is signed in:", user);
      // User is signed in
      const hiddenButtons = document.querySelectorAll('.not-logged');
      const visibleButtons = document.querySelectorAll('.logged');

      // Hide not-logged buttons
      hiddenButtons.forEach((button) => {
        button.style.display = "none";
      });

      // Show logged buttons
      visibleButtons.forEach((button) => {
        button.style.display = "block"; // or "flex" if needed
      });
    } else {
      console.log("No user is signed in.");
      // User is not signed in
      const hiddenButtons = document.querySelectorAll('.logged');
      const visibleButtons = document.querySelectorAll('.not-logged');

      // Hide logged buttons
      hiddenButtons.forEach((button) => {
        button.style.display = "none";
      });

      // Show not-logged buttons
      visibleButtons.forEach((button) => {
        button.style.display = "block"; // or "flex" if needed
      });
    }
  });

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
        console.log("Calling loadSentences function");
        openStoryPage.openPage.loadSentences()
          .then(() => {
            console.log("Calling loadSentencesInfo function");
            openStoryPage.openPage.loadSentenceInfo();
          })
      })
  } else {
    console.error("No story ID found in the URL.");
  }

  //make header navigatable
  const logo = document.querySelector(".logo-text")
  if(logo){
    logo.addEventListener('click', () => {
      navigate('index')
    })
  }
});


//start a story with index
const storyButton = document.querySelector('.hero-start-button');
// event listener for button press
if (storyButton) {
  console.log("Story button");
  storyButton.addEventListener('click', () => {
    const auth = getAuth();
    if (auth.currentUser != null) {
      window.location.href = 'new-story.html';
    } else if(auth.currentUser == null){
      window.location.href = 'login.html';
    }
  });
}

//object for opening stories
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
    loadSentences(){
      return getDocs(openStoryPage.currentSentencesRef)
      .then((snapshot) => {
        snapshot.docs.forEach((doc) => {
          //create the sentence div
          const sentenceDiv = document.createElement('div')
          //apply id to sentence div
          const id = doc.id;
          sentenceDiv.setAttribute('id', id);
          sentenceDiv.className = "sentence"
          //fetch the sentence from db
          const data = doc.data();
          sentenceDiv.innerText = data["sentence"];
          //append sentence to card
          const sentencesContainer = document.querySelector('.actual-sentences-container');
          sentencesContainer.append(sentenceDiv);
        })
      })
    },
    loadSentenceInfo(){
      console.log("Adding event listeners to sentences...");
      const sentences = document.querySelectorAll('.sentence');
    
      sentences.forEach((sentence) => {
        sentence.addEventListener('click', () => {
          console.log("clicked!");
          const sentenceId = sentence.id;
          const sentenceRef = doc(db, 'stories', openStoryPage.id, "currentSentences", sentenceId);
          getDoc(sentenceRef).then((docSnapshot) => {
            if (docSnapshot.exists()) {
              console.log("Sentence data:", docSnapshot.data());
              const data = docSnapshot.data();
              const sentenceUser = data["user"];
              const sentenceTime = formatDate(data["time"]);
              const sentenceText = sentence.innerText;
              const dialog = document.querySelector("#dialog");
              dialog.showModal();
              const sentenceUserText = document.querySelector(".sentence-user")
              sentenceUserText.innerText = "User: " + sentenceUser
            }
          }).catch((error) => {
            console.error("Error fetching sentence:", error);
          });
        });
      });
    }
  },
}

//--Creating, then opening, stories--

//Upload created story to database
const addStoryForm = document.querySelector('.add')
if(addStoryForm){
  addStoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    //create a document for the chain of stories
    let date = new Date()
    addDoc(storiesRef, {
      title: addStoryForm.title.value,
      //string splitting method from StackOverflow https://stackoverflow.com/questions/10346722/how-to-split-a-string-by-white-space-or-comma
      genre: addStoryForm.genre.value.split(/[ ,]+/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()),
      time: Timestamp.fromDate(date),
      upvotes: 0,
      user: auth.currentUser.displayName,
      views: 0
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
        user: auth.currentUser.displayName
      })
      .then(() => {
        //open the story
        openStoryPage.openPage.openStoryPageLink();
      })
    })
  })
}



//--User auth--

//form submit
const signUpForm = document.querySelector('.signupform')
if(signUpForm){
  signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
  
    const email = signUpForm.email.value;
    const password = signUpForm.password.value;
    const displayName = signUpForm.username.value;
  
    createUserWithEmailAndPassword(auth, email, password)
      .then((cred) => {
        console.log("User created:", cred.user);
        return updateProfile(cred.user, {
          displayName: displayName, photoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png'
        });
      })
      .then(() => {
        signUpForm.reset();
        navigate('login');
      })
      .catch((err) => {
        console.log(err.message)
      })
  });
}

//log in email method
const logInForm = document.querySelector('.loginform');
if(logInForm){
  logInForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const email = logInForm.email.value;
    const password = logInForm.password.value;

    signInWithEmailAndPassword(auth, email, password)
      .then((cred) => {
        console.log("User logged in:", cred.user);
        logInForm.reset();
        window.location.href = 'index.html';
      })
        .catch((err) => {
        console.log(err.message)
     })
    
  })
}
//--Misc Functions

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
  }
});