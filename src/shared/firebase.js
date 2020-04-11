import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';

var firebaseConfig = {
    apiKey: "AIzaSyCJBpNb61XxQJOZTx65ls4xYMAawIFN8m8",
    authDomain: "scheduler-394.firebaseapp.com",
    databaseURL: "https://scheduler-394.firebaseio.com",
    projectId: "scheduler-394",
    storageBucket: "scheduler-394.appspot.com",
    messagingSenderId: "253392573334",
    appId: "1:253392573334:web:db1f05c83e7da57bad83b7"
  };
  
firebase.initializeApp(firebaseConfig);

export default firebase;