import { initializeApp } from 'firebase/app'
import {
  getFirestore, collection, getDocs, addDoc
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
addStoryForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  addDoc(storiesRef, {
    title: addStoryForm.title.value,
    //string splitting method from StackOverflow https://stackoverflow.com/questions/10346722/how-to-split-a-string-by-white-space-or-comma
    genre: addStoryForm.genre.value.split(/[ ,]+/),
    time: new Date(),
    upvotes: 0
  })
  .then((docRef) => {
    let id = docRef.id;
    console.log(id);
    const currentSentencesRef = collection(db, 'stories', id, "currentSentences");
    addDoc(currentSentencesRef, {
      sentence: addStoryForm.sentence.value,
      time: new Date()
    })
  })


})