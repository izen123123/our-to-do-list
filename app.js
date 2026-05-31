// 1. 비밀번호 잠금 장치 (그대로 유지)
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

// 2. 상태 변수 (초기 유저를 'dennie'로 설정)
let currentUser = 'dennie';
let todos = JSON.parse(localStorage.getItem('couple_todos')) || [];

// 자정 기준 타임스탬프 계산 함수
function getMidnightTimestamps() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - (24 * 60 * 60 * 1000);
    return { today, yesterday };
}

// 화면 그리기 (렌더링) 함수
function render() {
    const { today, yesterday } = getMidnightTimestamps();
    
    // [해결 2] 타이틀과 버튼 파란 불(active) 매칭을 dennie / chennie로 변경!
    document.getElementById('current-user-title').innerText = `${currentUser}'s To-Do List`;
    document.getElementById('btn-her').className = currentUser === 'dennie' ? 'active' : '';
    document.getElementById('btn-me').className = currentUser === 'chennie' ? 'active' : '';

    const todayListEl = document.getElementById('today-list');
    const yesterdayListEl = document.getElementById('yesterday-list');
    
    // 리스트 초기화 (안 하면 기존 거에 계속 중복해서 붙음)
    if (todayListEl) todayListEl.innerHTML = '';
    if (yesterdayListEl) yesterdayListEl.innerHTML = '';

    // 현재 선택된 유저의 투두만 필터링
    const userTodos = todos.filter(todo => todo.user === currentUser);

    userTodos.forEach(todo => {
        const li = document.createElement('li');
        
        // 체크박스
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.completed;
        checkbox.onclick = () => toggleTodo(todo.id);
        
        // 투두 텍스트
        const span = document.createElement('span');
        span.innerText = todo.text;
        if (todo.completed) span.className = 'completed';

        // 수정 버튼
        const editBtn = document.createElement('button');
        editBtn.innerText = '✏️';
        editBtn.className = 'todo-btn edit-btn';
        editBtn.onclick = () => modifyTodo(todo.id);

        // 삭제 버튼
        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = '🗑️';
        deleteBtn.className = 'todo-btn delete-btn';
        deleteBtn.onclick = () => deleteTodo(todo.id);

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);

        // [해결 1] 리스트에 추가하는 조건 검사
        if (todo.date === today) {
            if (todayListEl) todayListEl.appendChild(li);
        } else if (todo.date <= yesterday && !todo.completed) {
            if (yesterdayListEl) yesterdayListEl.appendChild(li);
        }
    });

    // 로컬 스토리지에 데이터 백업
    localStorage.setItem('couple_todos', JSON.stringify(todos));
}

// 투두 추가 함수
function addTodo() {
    const input = document.getElementById('todo-input');
    if (!input.value.trim()) return;

    const { today } = getMidnightTimestamps();

    const newTodo = {
        id: Date.now(),
        text: input.value.trim(),
        completed: false,
        date: today, // 오늘 자정 타임스탬프 고정
        user: currentUser // 현재 선택된 유저 이름으로 저장
    };

    todos.push(newTodo);
    input.value = ''; // 입력창 비우기
    render(); // [해결 1] 추가 후 화면 새로고침!
}

// 엔터키 쳐도 추가되게 돕는 보너스 코드
window.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('todo-input');
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTodo();
        });
    }
});

// 체크박스 토글
function toggleTodo(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });
    render();
}

// 투두 수정
function modifyTodo(id) {
    const targetTodo = todos.find(todo => todo.id === id);
    if (!targetTodo) return;

    const newText = prompt("What should I say instead?", targetTodo.text);
    if (newText !== null && newText.trim() !== "") {
        todos = todos.map(todo => {
            if (todo.id === id) {
                return { ...todo, text: newText.trim() };
            }
            return todo;
        });
        render();
    }
}

// 투두 삭제
function deleteTodo(id) {
    if (confirm("Are you really going to delete me..?")) {
        todos = todos.filter(todo => todo.id !== id);
        render();
    }
}

// 유저 전환 버튼 함수
function switchUser(user) {
    currentUser = user;
    render();
}

// 최초 실행
render();