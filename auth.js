const firebaseConfig = {
  apiKey: "AIzaSyBziQMB8prSDn4XS7calKH8JEYpi7ja2g8",
  authDomain: "giochi-commenti.firebaseapp.com",
  projectId: "giochi-commenti",
  storageBucket: "giochi-commenti.firebasestorage.app",
  messagingSenderId: "878667417604",
  appId: "1:878667417604:web:460f2de9a188fe0adb0d51"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

window.auth = auth;
window.db = db;

let currentUserData = null;

auth.signInAnonymously()
.catch(console.error);

auth.onAuthStateChanged(async user => {

    if(!user) return;

    const userRef =
    db.collection("users")
    .doc(user.uid);

    const snap =
    await userRef.get();

    if(!snap.exists){

        const randomId =
        Math.floor(Math.random()*9999);

        await userRef.set({

            username:
            user.displayName || user.email || ("User_" + randomId),

            avatar:
            user.photoURL || ("https://i.pravatar.cc/150?u=" + user.uid),

            createdAt:
            Date.now(),

            favorites:[]
        });
    }

    currentUserData =
    (await userRef.get()).data();

    window.currentUserData =
    currentUserData;

    const userName =
    document.getElementById("userName");

    const userAvatar =
    document.getElementById("userAvatar");

    if(userName){

        userName.textContent =

        currentUserData.username ||

        currentUserData.nickname ||

        "Connessione...";
    }

    const nicknameInput =
    document.getElementById("nicknameInput");

    if(nicknameInput){

        nicknameInput.value =
        currentUserData.username;

        nicknameInput.readOnly = true;
    }

    const propUser =
    document.getElementById("propUser");

    if(propUser){

        propUser.value =

        currentUserData.username ||

        currentUserData.nickname ||

        "Player";

        propUser.readOnly = true;
    }

    if(userAvatar){
        userAvatar.src =
        currentUserData.avatar;
    }

    const profilePopup =
    document.getElementById("profilePopup");

    const closeProfilePopup =
    document.getElementById("closeProfilePopup");

    closeProfilePopup?.addEventListener("click", () => {

        profilePopup.style.display =
        "none";
    });

    const openProfileEditor =
    document.getElementById("openProfileEditor");

    if(openProfileEditor){

        openProfileEditor.onclick = () => {

            document.getElementById("editNickname").value =
            currentUserData.username || "";

            document.getElementById("editAvatar").value =
            currentUserData.avatar || "";

            profilePopup.style.display =
            "flex";
        };
    }

    profilePopup?.addEventListener("click", e => {

        if(e.target === profilePopup){

            profilePopup.style.display =
            "none";
        }
    });

    const saveBtn =
    document.getElementById("saveProfileBtn");

    if(saveBtn){

        saveBtn.onclick = async () => {

            const newName =
            document.getElementById("editNickname").value;

            const newAvatar =
            document.getElementById("editAvatar").value;

            const user =
            auth.currentUser;

            if(!user) return;

            await db.collection("users")
            .doc(user.uid)
            .update({

                username:newName,

                avatar:newAvatar
            });

            currentUserData.username =
            newName;

            currentUserData.avatar =
            newAvatar;

            if(userName){

                userName.textContent =
                currentUserData.username;
            }

            if(userAvatar){

                userAvatar.src =
                currentUserData.avatar;
            }

            profilePopup.style.display =
            "none";
        };
    }

    console.log("AUTH OK");
});