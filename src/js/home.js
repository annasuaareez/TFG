import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { firebaseConfig, auth } from './firebase-config.js';
//import Chart from 'https://cdn.jsdelivr.net/npm/chart.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/*$('.sidebar-item').click(function () {
    $('.sidebar-item').removeClass('active');
    $(this).addClass('active');
});*/

/*$('#dashboard').click(function () {
    window.location.href = 'home.html';
});

$('#users').click(function () {
    window.location.href = 'user.html';
});

$('#logOut').click(function () {
    auth.signOut().then(function () {
        window.location.href = 'index.html';
    }).catch(function (error) {
        console.error("Error signing out:", error);
    });
});*/

$(document).ready(function () {
    //const loaderContainer = $('.loading-overlay');

    /*function showLoader() {
        loaderContainer.addClass('active');
    }

    function hideLoader() {
        loaderContainer.removeClass('active');
    }*/

    // Recuperar la información del usuario
    const userData = sessionStorage.getItem('userData');
    console.log("User data from sessionStorage:", userData);

    if (userData) {
        const parsedUserData = JSON.parse(userData);
        $('#user-name').text(parsedUserData.firstName);
        $('#user-email').text(parsedUserData.email);
        const profileImageUrl = parsedUserData.profileImage || '../img/profile_picture.png';
        $('#profile-pic').attr('src', profileImageUrl);
    } else {
        console.error("No user data found in sessionStorage!");
    }

    getData();

    async function getData() {
        try {

            //showLoader();

            const userSnapshot = await getDocs(collection(db, 'users'));
            const postSnapshot = await getDocs(collection(db, 'posts'));
            const clothesSnapshot = await getDocs(collection(db, 'clothes'));

            // Contadores
            $('#user-count').text(userSnapshot.size);
            $('#post-count').text(postSnapshot.size);
            $('#clothes-count').text(clothesSnapshot.size);

            // Generar datos gráfica
            const labels = ['Users', 'Posts', 'Clothes'];
            const data = [userSnapshot.size, postSnapshot.size, clothesSnapshot.size];


            // Configurar la gráfica
            const ctx = document.getElementById('activity-chart').getContext('2d');
            const activityChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Activity',
                        data: data,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    label += labels[context.dataIndex] + ': ' + context.parsed.y;
                                    return label;
                                }
                            }
                        }
                    }
                }
            });

            //hideLoader();
        } catch (error) {
            console.error("Error getting documents: ", error);
            //hideLoader();
        }
    }

    function saveUserDataAndNavigate(url) {
        const userData = {
            firstName: $('#user-name').text(),
            email: $('#user-email').text(),
            profileImage: $('#profile-pic').attr('src')
        };
        sessionStorage.setItem('userData', JSON.stringify(userData));
        window.location.href = url;
    }

    $('#dashboard').click(function () {
        saveUserDataAndNavigate('home.html');
    });

    $('#users').click(function () {
        saveUserDataAndNavigate('user.html');
    });

    $('#logOut').click(function () {
        auth.signOut().then(function () {
            sessionStorage.removeItem('userData');
            window.location.href = 'index.html';
        }).catch(function (error) {
            console.error("Error signing out:", error);
        });
    });

});
