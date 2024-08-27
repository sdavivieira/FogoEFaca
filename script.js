document.addEventListener('DOMContentLoaded', () => {
  const numQuestions = 22;
  const questionsContainer = document.getElementById('question-container');
  const nextBtn = document.getElementById('nextBtn');
  const previousBtn = document.getElementById('previousBtn');
  const result = document.getElementById('result');
  const correctCountElem = document.getElementById('correctCount');
  const incorrectCountElem = document.getElementById('incorrectCount');
  const reviewList = document.getElementById('reviewList');
  const colorPicker = document.getElementById('colorPicker');
  const brushSizeInput = document.getElementById('brushSize');
  const restartBtn = document.getElementById('restartBtn');
  const finalizarBtn = document.getElementById('finalizarBtn');

  // Adicione aqui as variáveis para o histórico de estados dos canvas
  const canvasStates = {
    canvas1: [],
    canvas2: []
  };

  let currentColor = '#000000';
  let currentQuestionIndex = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let userFeedback = {};
  let wrongQuestions = [];

  const questions = [
    { text: 'Caboclo Cruzado com Velho de Congo em Aspiral e em Grupial, firmado com velho de Bahia', imgSrc: 'Questao1.png' },
    { text: 'Xangô Rasteiro nos hejos em aspiral, firmado com Criança do mar', imgSrc: 'Questao2.png' },
    { text: 'Caboclo Vingança cruzado com Velho de Angola em aspiral, firmado com Oxum Maré', imgSrc: 'Questao3.png' },
    { text: 'Caboclo Vingança na quimbanda em grupial com garfo, firmado com Iansã do mar', imgSrc: 'Questao4.png' },
    { text: 'Caboclo na quimbanda em grupial com garfo e firmeza de Ogum Beira mar', imgSrc: 'Questao5.png' },
    { text: 'Xangô rasteiro em aspiral, com firmeza de Velho de Minas', imgSrc: 'Questao6.png' },
    { text: 'Velho de Angola cruzado com Tranca-ruas em nagô com firmeza de Iansã da Cachoeira.', imgSrc: 'Questao7.png' },
    { text: 'Caboclo nos hejos em aspiral firmado com Ogum Beira mar', imgSrc: 'Questao8.png' },
    { text: 'Caboclo Vingança na quimbanda com garfo, e em nagô, firmado com Nanã.', imgSrc: 'Questao9.png' },
    { text: 'Caboclo Vingança em Nagô em aspiral, firmado com Oxum Mariô.', imgSrc: 'Questao10.png' },
    { text: 'Ogum nos hejos em aspiral, firmado com Iemanjá.', imgSrc: 'Questao11.png' },
    { text: 'Velho de Bahia em Nagô em aspiral, firmado com Nanã Conga.', imgSrc: 'Questao12.png' },
    { text: 'Velho de Congo em Nagô em aspiral, firmado com Caboclo Sete Flechas', imgSrc: 'Questao13.png' },
    { text: 'Velho de Angola em Nagô em aspiral, firmado com Ogum Megê', imgSrc: 'Questao14.png' },
    { text: 'Velho de Minas cruzado com Caboclo na quimbanda em Nagô na encruza, firmado com Oxum Megá', imgSrc: 'Questao15.png' },
    { text: 'Velho de Angola na quimbanda em grupial, uma seta pro fogo, firmado com Xangô da Pedreira', imgSrc: 'Questao16.png' },
    { text: 'Xangô em Nagô em aspiral, firmado com Iansã da Cachoeira', imgSrc: 'Questao17.png' },
    { text: 'Xangô cruzado com Criança e Ogum em Mussurumim uma seta pro fogo, firmado com Xangô Alafim', imgSrc: 'Questao18.png' },
    { text: 'Iansã em Nagô, uma seta pro fogo, firmado com Ogum de Lei', imgSrc: 'Questao19.png' },
    { text: 'Criança na quimbanda,uma seta pro fogo, firmado com Nanã', imgSrc: 'Questao20.png' },
    { text: 'Pomba Gira da Calunga em Nagô. (Fora e Dentro)', imgSrc: 'Questao21.png' },
    { text: 'Exú da Calunga aspiral, firmado com Xangô Agodô', imgSrc: 'Questao22.png' }
  ];

  function isMobile() {
    return window.matchMedia("only screen and (max-width: 768px)").matches;
  }

  function createQuestion(index) {
    const question = questions[index];
    const questionDiv = document.createElement('div');
    questionDiv.classList.add('question');

    questionDiv.innerHTML = `
      <div class="canvas-wrapper">
        <h2>Questão ${index + 1}</h2>
        <p>${question.text}</p>
        <button class="showReferenceBtn">Mostrar Referência</button>
        <div>
          <h3>Imagem de Referência</h3>
          <img class="referenceImage" src="${question.imgSrc}" alt="Imagem de Referência" style="display: none;">
        </div>
      </div>
      <div class="canvas-container">
        <div>
          <h3>Ponto Riscado</h3>
          <canvas class="canvas1" width="500" height="500"></canvas>
          <div class="undo-clear-group">
            <button class="undoBtn" id="undoCanvas1">Desfazer Ponto Riscado</button>
            <button class="clearBtn" id="clearCanvas1">Limpar</button>
          </div>
        </div>
        <div>
          <h3>Ponto Firmado</h3>
          <canvas class="canvas2" width="500" height="500"></canvas>
          <div class="undo-clear-group">
            <button class="undoBtn" id="undoCanvas2">Desfazer Ponto Firmado</button>
            <button class="clearBtn" id="clearCanvas2">Limpar</button>
          </div>
        </div>
      </div>
      <div>
        <h3>Feedback</h3>
        <label>
          <input type="radio" name="feedback" value="correct"> Acertou
        </label>
        <label>
          <input type="radio" name="feedback" value="incorrect"> Não Acertou
        </label>
      </div>
    `;

    questionsContainer.innerHTML = '';
    questionsContainer.appendChild(questionDiv);

    const showReferenceBtn = questionDiv.querySelector('.showReferenceBtn');
    const referenceImage = questionDiv.querySelector('.referenceImage');
    const canvas1 = questionDiv.querySelector('.canvas1');
    const canvas2 = questionDiv.querySelector('.canvas2');

    if (!canvas1 || !canvas2) return;

    const ctx1 = canvas1.getContext('2d');
    const ctx2 = canvas2.getContext('2d');

    if (!ctx1 || !ctx2) {
      console.error('Não foi possível obter o contexto dos canvas');
      return;
    }

    let isDrawing1 = false;
    let isDrawing2 = false;
    let lastX1 = 0;
    let lastY1 = 0;
    let lastX2 = 0;
    let lastY2 = 0;

    function getPosition(event, canvas) {
      const rect = canvas.getBoundingClientRect();
      let x, y;
    
      if (event.touches && event.touches.length > 0) {
        const touch = event.touches[0];
        x = touch.clientX - rect.left;
        y = touch.clientY - rect.top;
      } else {
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;
      }
    
      // Ajuste de escala para compensar a diferença de dimensão
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      x *= scaleX;
      y *= scaleY;
    
      return { x, y };
    }
    

    function startDrawing1(event) {
      isDrawing1 = true;
      const pos = getPosition(event, canvas1);
      [lastX1, lastY1] = [pos.x, pos.y];
      event.preventDefault();
    }

    function stopDrawing1() {
      isDrawing1 = false;
      ctx1.beginPath();
    }

    if (colorPicker) {
      colorPicker.addEventListener('change', (event) => {
        currentColor = event.target.value; // Atualiza a cor conforme o usuário seleciona
      });
    }
    function draw1(event) {
      if (!isDrawing1) return;

      const pos = getPosition(event, canvas1);

      ctx1.strokeStyle = currentColor;
      ctx1.lineWidth = brushSizeInput ? brushSizeInput.value : 5;
      ctx1.lineCap = 'round';
      ctx1.lineJoin = 'round';

      ctx1.beginPath();
      ctx1.moveTo(lastX1, lastY1);
      ctx1.lineTo(pos.x, pos.y);
      ctx1.stroke();

      [lastX1, lastY1] = [pos.x, pos.y];
      saveState('canvas1');
      event.preventDefault();
    }

    function startDrawing2(event) {
      isDrawing2 = true;
      const pos = getPosition(event, canvas2);
      [lastX2, lastY2] = [pos.x, pos.y];
      event.preventDefault();
    }

    function stopDrawing2() {
      isDrawing2 = false;
      ctx2.beginPath();
    }

    function draw2(event) {
      if (!isDrawing2) return;

      const pos = getPosition(event, canvas2);

      ctx2.strokeStyle = currentColor;
      ctx2.lineWidth = brushSizeInput ? brushSizeInput.value : 5;
      ctx2.lineCap = 'round';
      ctx2.lineJoin = 'round';

      ctx2.beginPath();
      ctx2.moveTo(lastX2, lastY2);
      ctx2.lineTo(pos.x, pos.y);
      ctx2.stroke();

      [lastX2, lastY2] = [pos.x, pos.y];
      saveState('canvas2');
      event.preventDefault();
    }

    function saveState(canvasId) {
      const canvas = document.querySelector(`.${canvasId}`);
      const dataURL = canvas.toDataURL();
      canvasStates[canvasId].push(dataURL);
    }

    function undo(canvasId) {
      if (canvasStates[canvasId].length === 0) return;
      canvasStates[canvasId].pop();
      const canvas = document.querySelector(`.${canvasId}`);
      const ctx = canvas.getContext('2d');
      const lastState = canvasStates[canvasId][canvasStates[canvasId].length - 1];
      const img = new Image();
      img.src = lastState || '';
      img.onload = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
    }

    function clearCanvas(canvasId) {
      const canvas = document.querySelector(`.${canvasId}`);
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvasStates[canvasId] = [];
    }

    showReferenceBtn.addEventListener('click', () => {
      referenceImage.style.display = referenceImage.style.display === 'none' ? 'block' : 'none';
    });

    canvas1.addEventListener('mousedown', startDrawing1);
    canvas1.addEventListener('mouseup', stopDrawing1);
    canvas1.addEventListener('mousemove', draw1);
    canvas1.addEventListener('touchstart', startDrawing1);
    canvas1.addEventListener('touchend', stopDrawing1);
    canvas1.addEventListener('touchmove', draw1);

    canvas2.addEventListener('mousedown', startDrawing2);
    canvas2.addEventListener('mouseup', stopDrawing2);
    canvas2.addEventListener('mousemove', draw2);
    canvas2.addEventListener('touchstart', startDrawing2);
    canvas2.addEventListener('touchend', stopDrawing2);
    canvas2.addEventListener('touchmove', draw2);

    const undoBtn1 = document.getElementById('undoCanvas1');
    const undoBtn2 = document.getElementById('undoCanvas2');
    const clearBtn1 = document.getElementById('clearCanvas1');
    const clearBtn2 = document.getElementById('clearCanvas2');

    if (undoBtn1) undoBtn1.addEventListener('click', () => undo('canvas1'));
    if (undoBtn2) undoBtn2.addEventListener('click', () => undo('canvas2'));
    if (clearBtn1) clearBtn1.addEventListener('click', () => clearCanvas('canvas1'));
    if (clearBtn2) clearBtn2.addEventListener('click', () => clearCanvas('canvas2'));

    document.querySelectorAll('input[name="feedback"]').forEach(radio => {
      radio.addEventListener('change', () => {
        userFeedback[currentQuestionIndex] = radio.value;
      });
    });
  }

  function showResults() {
    result.style.display = 'block';
    correctCountElem.textContent = correctCount;
    incorrectCountElem.textContent = incorrectCount;

    reviewList.innerHTML = '';
    wrongQuestions.forEach((question, index) => {
      const listItem = document.createElement('li');
      listItem.textContent = `Questão ${question + 1}`;
      reviewList.appendChild(listItem);
    });
  }

  function updateCounts() {
    correctCount = Object.values(userFeedback).filter(feedback => feedback === 'correct').length;
    incorrectCount = Object.values(userFeedback).filter(feedback => feedback === 'incorrect').length;

    if (userFeedback[currentQuestionIndex] === 'incorrect') {
      wrongQuestions.push(currentQuestionIndex);
    }
  }

  nextBtn.addEventListener('click', () => {
    updateCounts();
    currentQuestionIndex++;
    if (currentQuestionIndex >= numQuestions) {
      showResults();
    } else {
      createQuestion(currentQuestionIndex);
    }
  });

  previousBtn.addEventListener('click', () => {
    updateCounts();
    currentQuestionIndex--;
    if (currentQuestionIndex < 0) currentQuestionIndex = 0;
    createQuestion(currentQuestionIndex);
  });

  restartBtn.addEventListener('click', () => {
    currentQuestionIndex = 0;
    correctCount = 0;
    incorrectCount = 0;
    userFeedback = {};
    wrongQuestions = [];
    createQuestion(currentQuestionIndex);
    result.style.display = 'none';
  });

  finalizarBtn.addEventListener('click', () => {
    updateCounts();
    showResults();
  });
  
  colorPicker.addEventListener('input', (event) => {
    const color = event.target.value;
    if (isValidColor(color)) {
      currentColor = color;
    } else {
      console.error('Cor inválida:', color);
    }
  });
  
  // Adicione uma função para verificar se a cor é válida
  function isValidColor(color) {
    const s = new Option().style;
    s.color = color;
    return s.color === color;
  }
  
  // Iniciar com a primeira questão
  createQuestion(currentQuestionIndex);
});
