import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBxVz34GE_DWVwhsJPwTwmNsuq1Gk7hTnI",
  authDomain: "our-to-do-list-f19d4.firebaseapp.com",
  projectId: "our-to-do-list-f19d4",
  storageBucket: "our-to-do-list-f19d4.firebasestorage.app",
  messagingSenderId: "49736301438",
  appId: "1:49736301438:web:fc4afc9f4a7867609f512f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 비밀번호 확인 먼저
const SECRET_PASSWORD = "1209";
let accessGranted = sessionStorage.getItem('isLoggedIn');

while (!accessGranted) {
  let pw = prompt("Type in our anniversary date and month💜");
  if (pw === SECRET_PASSWORD) {
    sessionStorage.setItem('isLoggedIn', 'true');
    accessGranted = true;
  } else {
    alert("You sure 🤨");
    alert("Try again!");
  }
}
// 이미 로그인된 경우
document.querySelector('.container').style.display = 'block';

// 비밀번호 통과 후에만 아래 코드 실행
let currentUser = 'dennie';
let todos = [];

function getMidnightTimestamps() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - (24 * 60 * 60 * 1000);
  return { today, yesterday };
}

function render() {
  const { today, yesterday } = getMidnightTimestamps();

  document.getElementById('current-user-title').innerText = `${currentUser}'s To-Do List`;

  document.getElementById('btn-dennie').className = currentUser === 'dennie' ? 'active' : '';
  document.getElementById('btn-chennie').className = currentUser === 'chennie' ? 'active' : '';

  const todayListEl = document.getElementById('today-list');
  const yesterdayListEl = document.getElementById('yesterday-list');
  if (todayListEl) todayListEl.innerHTML = '';
  if (yesterdayListEl) yesterdayListEl.innerHTML = '';

  const userTodos = todos.filter(todo => todo.user === currentUser);

  userTodos.forEach(todo => {
    const li = document.createElement('li');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.onclick = () => toggleTodo(todo.id, todo.completed);

    const span = document.createElement('span');
    span.innerText = todo.text;
    if (todo.completed) span.className = 'completed';

    const editBtn = document.createElement('button');
    editBtn.innerText = '✏️';
    editBtn.className = 'todo-btn edit-btn';
    editBtn.onclick = () => modifyTodo(todo.id, todo.text);

    const deleteBtn = document.createElement('button');
    deleteBtn.innerText = '🗑️';
    deleteBtn.className = 'todo-btn delete-btn';
    deleteBtn.onclick = () => deleteTodo(todo.id);

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);

    if (todo.date === today) {
      if (todayListEl) todayListEl.appendChild(li);
    } else if (todo.date <= yesterday && !todo.completed) {
      if (yesterdayListEl) yesterdayListEl.appendChild(li);
    }
  });
}

// Firestore 실시간 연동
onSnapshot(collection(db, "todos"), (snapshot) => {
  todos = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  render();
});

async function addTodo() {
  const input = document.getElementById('todo-input');
  if (!input.value.trim()) return;

  const { today } = getMidnightTimestamps();

  await addDoc(collection(db, "todos"), {
    text: input.value.trim(),
    completed: false,
    date: today,
    user: currentUser
  });

  input.value = '';
}

window.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('todo-input');
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addTodo();
    });
  }
});

async function toggleTodo(id, currentStatus) {
  await updateDoc(doc(db, "todos", id), { completed: !currentStatus });
}

async function modifyTodo(id, currentText) {
  const newText = prompt("What should I say instead?", currentText);
  if (newText !== null && newText.trim() !== "") {
    await updateDoc(doc(db, "todos", id), { text: newText.trim() });
  }
}

async function deleteTodo(id) {
  if (confirm("Are you really going to delete me..?")) {
    await deleteDoc(doc(db, "todos", id));
  }
}

// 전역으로 등록해야 html onclick에서 호출 가능
window.switchUser = function(user) {
  currentUser = user;
  render();
}

window.addTodo = addTodo;