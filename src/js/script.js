console.log("Script");

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-lite.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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
const db = getFirestore(app);
const auth = getAuth(app);

$(document).ready(function () {
    // Cambiar de vista
    $('#goRight').on('click', function () {
        $('#slideBox').animate({
            'marginLeft': '0'
        });
        $('.topLayer').animate({
            'marginLeft': '100%'
        });
    });
    $('#goLeft').on('click', function () {
        if (window.innerWidth > 769) {
            $('#slideBox').animate({
                'marginLeft': '50%'
            });
        } else {
            $('#slideBox').animate({
                'marginLeft': '20%'
            });
        }
        $('.topLayer').animate({
            'marginLeft': '0'
        });
    });

    // Registro
    $('#form-signup').on('submit', async function (event) {
        event.preventDefault(); 
        const $form = $(this);
        const $submitButton = $form.find('button[type="submit"]');
        $submitButton.attr('disabled', true); 

        const email = $('#email-signup').val();
        const firstName = $('#firstName-signup').val();
        const password = $('#password-signup').val();

        try {
            // Verificar si se encuentra el correo en el "validAdmin"
            const validAdminSnapshot = await getDocs(collection(db, 'validAdmin'));
            const validAdmin = validAdminSnapshot.docs.find(doc => doc.data().email === email);

            if (!validAdmin) {
                alert("You don't have permission to register as an administrator.");
                $submitButton.attr('disabled', false);
                return; 
            }

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const userId = userCredential.user.uid;

            await setDoc(doc(db, "admin", userId), {
                email: email,
                firstName: firstName,
                profileImage: "",
                admin: true 
            });

            alert("User registered successfully as an administrator.");

            $('#email-signup').val('');
            $('#firstName-signup').val('');
            $('#password-signup').val('');
        } catch (error) {
            console.error("Error registering the user: ", error);
            alert("Error registering the user: " + error.message);
        } finally {
            $submitButton.attr('disabled', false);
        }
    });

    // Log In
    $('#form-login').on('submit', async function (event) {
        event.preventDefault();
        const $form = $(this);
        const $submitButton = $form.find('button[type="submit"]');
        $submitButton.attr('disabled', true);

        const email = $('#email-login').val();
        const password = $('#password-login').val();

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("Logged in successfully");
            
            const userId = userCredential.user.uid;
            const userDoc = await getDoc(doc(db, "admin", userId));

            if (userDoc.exists()) {
                const userData = userDoc.data();
                console.log("User data retrieved:", userData);
                sessionStorage.setItem('userData', JSON.stringify(userData));
                console.log("User data saved to sessionStorage.");
            } else {
                console.error("No user data found!");
            }

            window.location.href = "./home.html";
        } catch (error) {
            console.error("Error signing in: ", error);
            alert("Error signing in: " + error.message);
        } finally {
            $submitButton.attr('disabled', false); 
        }
    });

});