const params = new URLSearchParams(window.location.search);
const gameId = params.get("id");

if (!gameId) {
  document.body.innerHTML = "Errore URL";
  throw new Error("ID mancante");
}

const game = gamesData[gameId];

if (!game) {
  document.body.innerHTML = "<h1>Gioco non trovato</h1>";
  throw new Error("Game non trovato");
}

document.getElementById("title").textContent = game.title;
document.title = game.title + " - Casa dei Giochi";
document.getElementById("description").textContent = game.description;
document.getElementById("downloadBtn").href = game.download;

const media = game.media || [];

const mainMedia = document.getElementById("mainMedia");
const mediaBar = document.getElementById("mediaBar");

let currentIndex = 0;

function renderMain(index) {
    const item = media[index];
    if (!item) return;
	
	mainMedia.innerHTML = "";

    if (item.type === "video") {

        // 🎥 YouTube embed FIX
        const iframe = document.createElement("iframe");
        iframe.src = item.src + "?autoplay=1&rel=0";
        iframe.frameBorder = "0";
        iframe.allow = "autoplay; encrypted-media";
        iframe.allowFullscreen = true;

        mainMedia.appendChild(iframe);

    } else {

        const img = document.createElement("img");
        img.src = item.src;
        img.style.width = "100%";
        img.style.borderRadius = "12px";
		
        mainMedia.appendChild(img);
    }

    document.querySelectorAll(".thumb").forEach((t, i) => {
        t.classList.toggle("active", i === index);
    });
}

function renderBar() {
    mediaBar.innerHTML = ""; // 🔥 importantissimo

    media.forEach((item, index) => {
        const thumb = document.createElement("img");
        thumb.classList.add("thumb");

        // thumbnail sempre img (anche video → preview)
        if (item.type === "video") {
            const videoId = item.src.split("/embed/")[1]?.split("?")[0];
            thumb.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        } else {
            thumb.src = item.src;
        }

        thumb.onclick = () => {
            currentIndex = index;
            renderMain(index);
        };

        mediaBar.appendChild(thumb);
    });
}

renderBar();
renderMain(0);

document.getElementById("minReq").innerHTML = game.requirements.min;
document.getElementById("recReq").innerHTML = game.requirements.rec;

function sendComment() {

  if(!window.currentUserData){

    alert("Attendi il caricamento account");

    return;
  }

  const text = document.getElementById("commentInput").value;
  const color = document.getElementById("colorPicker").value;

  if (!text.trim()) return;

  db.collection("comments")
    .doc(gameId)
    .collection("list")
    .add({
      text,
      user: window.currentUserData?.username || "Player",

      avatar:
      window.currentUserData?.avatar ||
      "https://i.pravatar.cc/150",

      uid:
      window.auth?.currentUser?.uid || null,
      color,
      style: null,
      date: Date.now()
    });

  document.getElementById("commentInput").value = "";
}

db.collection("comments")
  .doc(gameId)
  .collection("list")
  .orderBy("date")
  .onSnapshot(snapshot => {

    const container = document.getElementById("comments");
    container.innerHTML = "";

    snapshot.forEach(doc => {
      const data = doc.data();

      const date = new Date(data.date).toLocaleString();

      container.innerHTML += `
        <div class="commentRow">

          <div class="commentHeader">

            <img
              class="commentAvatar"
              src="${data.avatar}">

            <div
              class="commentUser"
              style="color:${data.color}">

              ${data.user}

            </div>

          </div>

          <div class="commentText">
            ${data.text}
          </div>

          <div class="commentDate">
            ${date}
          </div>

        </div>
      `;
    });

  });

function toggleEmojiPicker() {
    const picker = document.getElementById("emojiPicker");

    picker.style.display =
        picker.style.display === "flex" ? "none" : "flex";
}

function addEmoji(emoji) {
    const input = document.getElementById("commentInput");
    input.value += emoji;
    input.focus();
}
