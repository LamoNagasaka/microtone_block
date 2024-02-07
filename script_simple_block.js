
const audioContext = new (window.AudioContext || window.webkitAudioContext)(); //Web Audio APIを使用して音声を操作するためのAudio Contextを作成する
const keyMap = '1234567890QWERTYUIOPASDFGHJKLZXCVBNM'.split(''); //キーボードのキーと対応する周波数をマッピングするための'keyMap'を定義
let frequencies = [];  //生成された周波数を格納するための'frequencies'を定義する
let oscillators = {};  //オシレーターを管理するためのオブジェクト'oscillators'を定義する


//音の再生
function startPlayingFrequency(frequency, key) {
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine'; //サイン音
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.connect(audioContext.destination);
    oscillator.start();

    oscillators[key] = oscillator; // オシレーターを保存
    highlightKey(keyMap.indexOf(key));
}

//音の停止
function stopPlayingFrequency(key) {
    if (oscillators[key]) {
        oscillators[key].stop();
        oscillators[key].disconnect();
        delete oscillators[key]; //停止したオシレーターを削除
        removeHighlight(keyMap.indexOf(key));
    }
}

//キーボードのスケールを生成する
function generateScale() {
    const division = Math.min(document.getElementById('division').value, 31); // 最大31分割まで
    const rootFrequency = 440; // A4の周波数
    frequencies = [];

    for (let i = 0; i < division; i++) {
        const frequency = rootFrequency * Math.pow(2, i / division);
        frequencies.push(frequency);
    }
    updateKeyboardLayout(division); 
}

////ブロック型の作成
function updateKeyboardLayout(division) {
    const notesDiv = document.getElementById('keyboard-container');
    const freqDiv = document.getElementById('frequencies');
    notesDiv.innerHTML = '';
    freqDiv.innerHTML = ''; // 周波数表示エリアをクリア
    const keyWidth = 50; // 鍵盤の幅
    const keyHeight = 200; // 鍵盤の高さ
    const margin =5 ; //鍵盤の間隔

    for (let i = 0; i < division; i++) {
        const x = i * (keyWidth+margin); // 鍵盤ごとに横方向に配置
        const y = 0;

        const noteDiv = document.createElement('div');
        noteDiv.className = 'note'; //
        noteDiv.style.left = `${x}px`;
        noteDiv.style.top = `${y}px`;
        noteDiv.style.width = `${keyWidth}px`;
        noteDiv.style.height = `${keyHeight}px`;
        noteDiv.style.background = 'white'; // 鍵盤の色
        noteDiv.textContent = keyMap[i];
        noteDiv.onclick = () => playFrequency(frequencies[i], i); // クリックで音を再生
        notesDiv.appendChild(noteDiv);

        const freqSpan = document.createElement('div');
        freqSpan.innerHTML = `${keyMap[i]}=${frequencies[i].toFixed(2)}Hz `;
        freqDiv.appendChild(freqSpan);
    }
}

//キーがクリック（またはタップ）されると特定の周波数の音を再生
//オシレーターを作成し、周波数を設定し、オーディオコンテキストの宛先に接続し、再生を開始し、0.5秒後に停止
function playFrequency(frequency, keyIndex) {
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.connect(audioContext.destination);
    oscillator.start(); //再生
    oscillator.stop(audioContext.currentTime + 0.5); //0.5秒後に停止

    highlightKey(keyIndex);
}


////キーボード制御
//キーが押されたときに呼び出される関数
function handleKeyDown(event) { 
    const key = event.key.toUpperCase(); //イベントから押されたキーを取得し、大文字に変換してkey に格納する。これにより、大文字と小文字のキーの区別をなくす。
    const keyIndex = keyMap.indexOf(key); //
    if (keyIndex >= 0 && keyIndex < frequencies.length && !oscillators[key]) {
        startPlayingFrequency(frequencies[keyIndex], key);
    }
}

//キーが離されたときに呼び出される関数
function handleKeyUp(event) { 
    const notes = document.getElementsByClassName('note');
    for (let i = 0; i < notes.length; i++) {
            notes[i].style.border = 'solid black 1px';
    }

    const key = event.key.toUpperCase();
    if (oscillators[key]) {
        stopPlayingFrequency(key);
    }
}

//初期化
window.onload = () => { 
    generateScale();
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
};
