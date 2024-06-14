import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';

const firebaseConfig = {
    apiKey: "AIzaSyDxwGybY_s5BwZoAkaHa59vvy5UC-kea2k",
    authDomain: "wondrobe-6b957.firebaseapp.com",
    projectId: "wondrobe-6b957",
    storageBucket: "wondrobe-6b957.appspot.com",
    messagingSenderId: "172335089066",
    appId: "1:172335089066:web:d3b60247fc1b2eb36a17d3",
    measurementId: "G-BF0G3YJ7TD"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export { firebaseConfig, auth };
