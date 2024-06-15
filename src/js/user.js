import { getFirestore, collection, getDocs, query, orderBy, limit, startAfter, where, deleteDoc, doc, setDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { firebaseConfig, auth } from './firebase-config.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { getStorage, ref, listAll, deleteObject } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-functions.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const authInstance = getAuth(app);
const storage = getStorage(app);
const functions = getFunctions(app);

const PAGE_SIZE = 10; 
let currentPage = 1;
let lastVisibleUser = null;

$(document).ready(function () {
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

    const userTable = $('#user-table tbody');
    async function loadUsers(page) {
        const usersRef = collection(db, 'users');
        let q;

        if (lastVisibleUser && page > 1) {
            q = query(usersRef, orderBy('firstName'), startAfter(lastVisibleUser), limit(PAGE_SIZE));
        } else {
            q = query(usersRef, orderBy('firstName'), limit(PAGE_SIZE));
        }

        const querySnapshot = await getDocs(q);
        userTable.empty(); 
        let index = (page - 1) * PAGE_SIZE + 1;

        querySnapshot.forEach((doc) => {
            const userData = doc.data();
            const firstName = userData.firstName || 'N/A';
            const userName = userData.username || 'N/A';
            const email = userData.email || 'N/A';

            userTable.append(`
                <tr data-username="${userName}">
                    <td>${index}</td>
                    <td>${firstName}</td>
                    <td>${userName}</td>
                    <td>${email}</td>
                    <td><i class="fa-solid fa-eye eye-icon"></i></td>
                </tr>
            `);
            index++;
        });

        lastVisibleUser = querySnapshot.docs[querySnapshot.docs.length - 1];
        $('#currentPage').text(currentPage);
        $('#prevPage').prop('disabled', currentPage === 1);
        $('#nextPage').prop('disabled', querySnapshot.size < PAGE_SIZE);

        $('.eye-icon').click(function () {
            const username = $(this).closest('tr').data('username');
            showUserDetail(username);
        });
    }

    $('#prevPage').click(function () {
        if (currentPage > 1) {
            currentPage--;
            loadUsers(currentPage);
        }
    });

    $('#nextPage').click(function () {
        currentPage++;
        loadUsers(currentPage);
    });

    $('#backToList').click(function () {
        $('#user-detail').hide();
        $('#user-list-container').show();
        $('#currentPage').show();
        $('#prevPage').show();
        $('#nextPage').show();
    });

    async function showUserDetail(username) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', username));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            const uid = userDoc.id;

            const profileImageUrl = userData.profileImage || '../img/profile_picture.png';
            $('#detail-profile-pic').attr('src', profileImageUrl);
            $('#detail-firstName').text(userData.firstName || 'N/A');
            $('#detail-username').text(userData.username || 'N/A');
            $('#detail-email').text(userData.email || 'N/A');

            $('#user-list-container').hide();
            $('#currentPage').hide();
            $('#prevPage').hide();
            $('#nextPage').hide();
            $('#user-detail').show();

            $('#banProfile').off('click').on('click', function () {
                banUserProfile(uid);
            });

            await loadUserPosts(uid);
        } else {
            console.error('No user found with username:', username);
        }
    }

    async function loadUserPosts(uid) {
        const postsRef = collection(db, 'posts');
        const q = query(postsRef, where('userId', '==', uid));
        const querySnapshot = await getDocs(q);

        const userPostList = $('#user-post-list');
        userPostList.empty();

        let postCount = 0;
        let currentRow = $('<div class="post-row"></div>');

        querySnapshot.forEach((doc) => {
            const postData = doc.data();
            const postImage = postData.imageUrl || '';
            const postTitle = postData.title || 'No Title';
            const postDescription = postData.description || 'No Description';

            const imageElement = postImage ? `<img src="${postImage}" alt="Post Image">` : '';

            const deleteButton = `<button class="delete-post" data-postid="${doc.id}">Delete</button>`;

            const postHTML = `
            <div class="post">
                ${imageElement}
                <div class="post-details">
                    <h3>${postTitle}</h3>
                    <p>${postDescription}</p>
                    ${deleteButton}
                </div>
            </div>`;
            currentRow.append(postHTML);

            postCount++;

            if (postCount % 3 === 0) {
                userPostList.append(currentRow);
                currentRow = $('<div class="post-row"></div>');
            }

        });

        if (postCount % 3 !== 0) {
            userPostList.append(currentRow);
        }

        $('.delete-post').click(function() {
            const postId = $(this).data('postid');
            deletePost(postId);
        });
    }

    async function deletePost(postId) {
        try {
            await deleteDoc(doc(db, 'posts', postId));
            console.log('Post deleted:', postId);
            alert('Post deleted successfully.');
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    }

    async function banUserProfile(uid) {
        try {
            // Primero, desactivamos el usuario
            await updateUserStatus(uid, { disabled: true });
    
            // Luego, eliminamos sus datos
            await deleteUserData(uid);
    
            alert('User has been banned and all related data has been deleted.');
            $('#backToList').click();
        } catch (error) {
            console.error('Error banning user:', error);
        }
    }

    async function updateUserStatus(uid, status) {
        try {
            await setDoc(doc(db, 'users', uid), status, { merge: true });
        } catch (error) {
            console.error('Error updating user status:', error);
            throw error;
        }
    }

    async function deleteUserData(uid) {
        try {
            // Borrar de la colección 'users'
            await deleteDoc(doc(db, 'users', uid));
            
            // Borrar posts del user
            const postsRef = collection(db, 'posts');
            const qPosts = query(postsRef, where('userId', '==', uid));
            const querySnapshotPosts = await getDocs(qPosts);
            
            querySnapshotPosts.forEach(async (doc) => {
                await deleteDoc(doc.ref);
            });

            // Borrar clothes del user
            const clothesRef = collection(db, 'clothes');
            const qClothes = query(clothesRef, where('userId', '==', uid));
            const querySnapshotClothes = await getDocs(qClothes);

            querySnapshotClothes.forEach(async (doc) => {
                await deleteDoc(doc.ref);
            });

            // Borrar datos del Firebase Storage
            const storageRef = ref(storage, `user/${uid}/`);
            const listResults = await listAll(storageRef);

            const deletePromises = listResults.items.map((itemRef) => deleteObject(itemRef));
            await Promise.all(deletePromises);

            console.log('User data deleted:', uid);
        } catch (error) {
            console.error('Error deleting user data:', error);
        }
    }

    loadUsers(currentPage);

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
