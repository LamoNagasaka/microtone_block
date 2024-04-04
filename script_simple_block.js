//Web Audio APIを使用して音声を操作するためのAudio Contextを作成する
const audioContext = new (window.AudioContext || window.webkitAudioContext)(); 
//キーボードのキーと対応する周波数をマッピングするための'keyMap'を定義
const keyMap = '1234567890QWERTYUIOPASDFGHJKLZXCVBNM'.split(''); 

//生成された周波数を格納するための配列を定義
let frequencies = [];  
//オシレーターを管理するためのオブジェクトを定義
let oscillators = {};  


//音を再生するためのオシレーターを作成し，再生する
function startPlayingFrequency(frequency, key) {
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine'; //オシレーターのタイプをサイン波に設定
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.connect(audioContext.destination); //オシレーターをオーディオの出力に接続する
    oscillator.start(); //オシレータを再生する
    oscillators[key] = oscillator; // オシレータをosillatorsオブジェクトに保存
    highlightKey(keyMap.indexOf(key)); //キーを強調表示する

}

//指定されたキーに対応するオシレーターの停止，削除
function stopPlayingFrequency(key) {
    if (oscillators[key]) {
        oscillators[key].stop(); 
        oscillators[key].disconnect(); //オシレーターをオーディオの出力から切断する
        delete oscillators[key]; //停止したオシレーターを削除する
        removeHighlight(keyMap.indexOf(key)); //キーの強調表示を削除する
    }
}

//キーボードのスケールを生成する
function generateScale() {
    const division = Math.min(document.getElementById('division').value, 31); // 最大31分割まで
    const rootFrequency = 440; // A4の周波数
    frequencies = [];

    for (let i = 0; i < division; i++) {
        const frequency = rootFrequency * Math.pow(2, i / division);
        frequencies.push(frequency); //計算された周波数をfrequencies配列にプッシュする
    }
    updateKeyboardLayout(division); //分割数に応じてキーボードの見た目を更新する
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
    // 押された鍵盤の色を変更する
    const noteDiv = document.getElementsByClassName('note')[keyIndex];
    noteDiv.style.background = 'lightgray'; // 背景色を変更
    noteDiv.style.border = 'solid black 2px'; // 枠の色を変更
}

//キーが離されたときに呼び出される関数
function handleKeyUp(event) { 
    const notes = document.getElementsByClassName('note');
    const key = event.key.toUpperCase();
    if (oscillators[key]) {
        stopPlayingFrequency(key);
    }

    // 鍵盤の色付けを元に戻す
    const keyIndex = keyMap.indexOf(key);
    const noteDiv = document.getElementsByClassName('note')[keyIndex];
    noteDiv.style.background = 'white'; // 背景色を元に戻す
    noteDiv.style.border = 'solid black 1px'; // 枠の色を元に戻す
    
}

//初期化
window.onload = () => { 
    generateScale();
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
};

