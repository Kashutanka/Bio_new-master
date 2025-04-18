const people = [
    {
        id: 'diana',
        name: 'Диана',
        birthday: '2002-07-09',
        colors: {
            physical: '#FF0000',
            emotional: '#d94646',
            intellectual: '#55080d'
        }
    },
    {
        id: 'kashtanka',
        name: 'Каштанка',
        birthday: '2008-08-17',
        colors: {
            physical: '#bd00db',
            emotional: '#e350e8',
            intellectual: '#760b7d'
        }
    },
    {
        id: 'lera',
        name: 'Лера',
        birthday: '2005-02-28',
        colors: {
            physical: '#00FF00',
            emotional: '#66FF66',
            intellectual: '#036706'
        }
    },
    {
        id: 'lima',
        name: 'Лима',
        birthday: '2008-07-30',
        colors: {
            physical: '#FFFF00',
            emotional: '#FFFF66',
            intellectual: '#a1a100'
        }
    },
    {
        id: 'masha',
        name: 'Маша',
        birthday: '1996-12-19',
        colors: {
            physical: '#f15f7e',
            emotional: '#F48FB1',
            intellectual: '#F8BBD0'
        }
    },
    {
        id: 'sonya',
        name: 'Соня',
        birthday: '2008-08-27',
        colors: {
            physical: '#0000FF',
            emotional: '#6666FF',
            intellectual: '#AAAAFF'
        }
    },
    {
        id: 'dasha',
        name: 'Даша',
        birthday: '2005-10-24',
        colors: {
            physical: '#FFA500',
            emotional: '#FFBB33',
            intellectual: '#FFD27F'
        }
    },
    {
        id: 'zhaniya',
        name: 'Жания',
        birthday: '2005-03-12',
        colors: {
            physical: '#e4c482',
            emotional: '#b08354',
            intellectual: '#9c662d'
        }
    },
    {
        id: 'leriya',
        name: 'Лерия',
        birthday: '2005-03-08',
        colors: {
            physical: '#00bda1',
            emotional: '#a2dcd1',
            intellectual: '#275653'
        }
    }
];

const biorhythmTypes = [
    { id: 'physical', name: 'Физический', cycle: 23 },
    { id: 'emotional', name: 'Эмоциональный', cycle: 28 },
    { id: 'intellectual', name: 'Интеллектуальный', cycle: 33 }
];

const dateInput = document.querySelector("#target-date");
const rangeInput = document.getElementById("range-days");
const canvas = document.getElementById("biorhythm-chart");
const ctx = canvas.getContext("2d");
const peopleCheckboxes = document.getElementById("people-checkboxes");

// Инициализация чекбоксов для людей
people.forEach(person => {
    const label = document.createElement('label');
    label.innerHTML = `
        <input type="checkbox" class="person-checkbox" value="${person.id}" checked>
        <span class="checkmark"></span>
        <span class="person-name" style="color: ${person.colors.physical}">${person.name}</span>
    `;
    peopleCheckboxes.appendChild(label);
});


const today = new Date();
dateInput.value = today.toISOString().split("T")[0];

function fixCanvasDPI() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // Масштабирование
}


function calculateDays(birthDate, targetDate) {
    const diffMs = targetDate - new Date(birthDate);
    const msPerDay = 24 * 60 * 60 * 1000;
    return diffMs / msPerDay;
}

function calculateBiorhythm(days, cycle) {
    return Math.sin((2 * Math.PI * days) / cycle);
}

function drawAxes(centerY, width, height, range, targetDate) {
    const marginX = 20;

    // Ось X
    ctx.strokeStyle = "#bbb";
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    // Вертикальная линия текущей даты
    const highlightX = marginX + (range / (range * 2)) * (width - 2 * marginX);
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(highlightX, 0);
    ctx.lineTo(highlightX, height);
    ctx.stroke();

    // Подписи дат на оси X
    const approxLabelSpacing = 60;
    const maxLabels = Math.floor((width - 2 * marginX) / approxLabelSpacing);
    const stepX = Math.max(1, Math.floor((range * 2) / maxLabels));
    const totalSteps = Math.floor((range * 2) / stepX);

    ctx.font = "14px sans-serif";
    ctx.fillStyle = "#aaa";
    ctx.textAlign = "center";

    for (let i = 0; i <= totalSteps; i++) {
        const dayOffset = -range + i * stepX;
        const x = marginX + ((dayOffset + range) / (range * 2)) * (width - 2 * marginX);
        const labelDate = new Date(targetDate);
        labelDate.setDate(labelDate.getDate() + dayOffset);
        const label = labelDate.toLocaleDateString("ru-RU").slice(0, 5);
        ctx.fillText(label, x, centerY + 24);
    }

    // Подписи значений на оси Y
    ctx.textAlign = "left";
    const ySteps = 4;
    for (let i = -ySteps; i <= ySteps; i++) {
        const y = centerY - (i / ySteps) * (height * 0.4);
        ctx.fillStyle = "#999";
        ctx.fillText((i / ySteps).toFixed(1), 5, y - 2);
    }
}

let animationFrame;
let currentFrame = 0;
const maxFrames = 60;
let prevData = [];

function drawGraph() {
    cancelAnimationFrame(animationFrame);
    currentFrame = 0;
    fixCanvasDPI();

    const targetDate = new Date(dateInput.value);
    const range = parseInt(rangeInput.value) || 5;
    const width = canvas.getBoundingClientRect().width;
    const height = canvas.getBoundingClientRect().height;
    const centerY = height / 2;
    const amplitude = height * 0.4;
    const marginX = 20;

    // Получаем выбранных людей и типы биоритмов
    const selectedPeople = people.filter(person =>
        document.querySelector(`.person-checkbox[value="${person.id}"]`).checked
    );

    const selectedBiorhythms = biorhythmTypes.filter(type =>
        document.querySelector(`.biorhythm-type[value="${type.id}"]`).checked
    );

    const newData = [];

    selectedPeople.forEach(person => {
        const baseDaysPassed = calculateDays(person.birthday, targetDate);
        const personData = [];

        selectedBiorhythms.forEach(biorhythm => {
            const data = [];
            for (let x = 0; x <= width; x++) {
                const plotX = marginX + (x / width) * (width - 2 * marginX);
                const dayOffset = ((plotX - marginX) / (width - 2 * marginX)) * range * 2 - range;
                const daysPassed = baseDaysPassed + dayOffset;
                const value = calculateBiorhythm(daysPassed, biorhythm.cycle);
                const y = centerY - value * amplitude;
                data.push(y);
            }
            personData.push(data);
        });

        newData.push({
            person,
            biorhythms: selectedBiorhythms,
            data: personData
        });
    });

    if (!prevData.length) {
        prevData = newData;
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        drawAxes(centerY, width, height, range, targetDate);

        ctx.lineWidth = 1.8;
        ctx.lineCap = "round";

        newData.forEach((personObj, personIdx) => {
            const person = personObj.person;
            const biorhythms = personObj.biorhythms;

            biorhythms.forEach((biorhythm, bioIdx) => {
                // Используем индивидуальный цвет для каждого типа биоритма
                ctx.strokeStyle = person.colors[biorhythm.id];
                ctx.beginPath();

                for (let x = 0; x <= width; x++) {
                    // Проверяем, существуют ли предыдущие данные для этого биоритма
                    const prevBioData = prevData[personIdx]?.data?.[bioIdx];
                    const y = prevBioData ? prevBioData[x] : personObj.data[bioIdx][x];
                    const targetY = personObj.data[bioIdx][x];
                    const currentY = prevBioData
                        ? y + (targetY - y) * (currentFrame / maxFrames)
                        : targetY;

                    if (x === 0) ctx.moveTo(x, currentY);
                    else ctx.lineTo(x, currentY);
                }
                ctx.stroke();
            });
        });

        if (currentFrame < maxFrames) {
            currentFrame++;
            animationFrame = requestAnimationFrame(animate);
        } else {
            prevData = newData;
            currentFrame = 0;
        }
    }

    animate();
}

// Обработчики событий
dateInput.addEventListener("input", drawGraph);
rangeInput.addEventListener("input", drawGraph);

rangeInput.addEventListener("blur", () => {
    if (!rangeInput.value || isNaN(parseInt(rangeInput.value))) {
        rangeInput.value = 5;
        drawGraph();
    }
});

window.addEventListener("resize", drawGraph());

// Добавляем обработчики для всех чекбоксов
document.querySelectorAll('.person-checkbox, .biorhythm-type').forEach(checkbox => {
    checkbox.addEventListener('change', drawGraph);
});

// Создаем тултип
const tooltip = document.createElement("div");
tooltip.className = "tooltip";
tooltip.style.display = "none";
document.body.appendChild(tooltip);

canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const width = rect.width;
    const height = rect.height;
    const centerY = height / 2;
    const amplitude = height * 0.4;
    const marginX = 20;

    const targetDate = new Date(dateInput.value);
    const range = parseInt(rangeInput.value) || 5;

    const dayOffset = ((mouseX - marginX) / (width - 2 * marginX)) * range * 2 - range;
    const currentDate = new Date(targetDate);
    currentDate.setDate(currentDate.getDate() + dayOffset);

    const selectedPeople = people.filter(person =>
        document.querySelector(`.person-checkbox[value="${person.id}"]`).checked
    );

    const selectedBiorhythms = biorhythmTypes.filter(type =>
        document.querySelector(`.biorhythm-type[value="${type.id}"]`).checked
    );

    let tooltipContent = `<div>${currentDate.toLocaleDateString('ru-RU')}</div>`;
    let hasContent = false;

    selectedPeople.forEach(person => {
        const daysPassed = calculateDays(person.birthday, currentDate);

        selectedBiorhythms.forEach(biorhythm => {
            const value = calculateBiorhythm(daysPassed, biorhythm.cycle);
            const y = centerY - value * amplitude;

            if (Math.abs(mouseY - y) < 6) {
                hasContent = true;
                const color = person.colors[biorhythm.id];
                tooltipContent += `<div><span style="color:${color};">${person.name} ${biorhythm.name}:</span> ${Math.round(value * 100)}%</div>`;
            }
        });
    });

    if (hasContent) {
        tooltip.innerHTML = tooltipContent;
        tooltip.style.display = "block";
        tooltip.style.left = e.pageX + 15 + "px";
        tooltip.style.top = e.pageY - 40 + "px";
    } else {
        tooltip.style.display = "none";
    }
});

canvas.addEventListener("mouseout", () => {
    tooltip.style.display = "none";
});

// Обработчик кнопки сброса
document.getElementById('clear-people').addEventListener('click', () => {
    document.querySelectorAll('.person-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    drawGraph();

    // Анимация кнопки
    const btn = document.getElementById('clear-people');
    btn.classList.add('shake');
    setTimeout(() => btn.classList.remove('shake'), 500);
});

// Первоначальная отрисовка
drawGraph();

// Модалки
const correlationBtn = document.getElementById("show-correlation");
const personalBtn = document.getElementById("show-personal");

const correlationModal = document.getElementById("correlation-modal");
const personalModal = document.getElementById("personal-modal");

const closeCorrelation = document.getElementById("close-correlation");
const closePersonal = document.getElementById("close-personal");

const correlationText = document.getElementById("correlation-text");
const personalText = document.getElementById("personal-text");

correlationBtn.addEventListener("click", () => {
  const targetDate = new Date(dateInput.value);
  const selectedPeople = people.filter(p =>
    document.querySelector(`.person-checkbox[value="${p.id}"]`)?.checked
  );
  const selectedBiorhythms = biorhythmTypes.filter(b =>
    document.querySelector(`.biorhythm-type[value="${b.id}"]`)?.checked
  );

  const values = selectedPeople.map(p => {
    const days = calculateDays(p.birthday, targetDate);
    const bio = {};
    selectedBiorhythms.forEach(b => {
      bio[b.id] = calculateBiorhythm(days, b.cycle);
    });
    return { person: p, bio };
  });

  let results = [];

  selectedBiorhythms.forEach(bio => {
    const bioValues = values.map(v => ({
      name: v.person.name,
      value: v.bio[bio.id]
    }));

    const used = new Set();

    for (let i = 0; i < bioValues.length; i++) {
      if (used.has(i)) continue;
      const group = [bioValues[i].name];
      for (let j = i + 1; j < bioValues.length; j++) {
        if (used.has(j)) continue;

        const diff = Math.abs(bioValues[i].value - bioValues[j].value);
        const samePhase = bioValues[i].value * bioValues[j].value > 0;

        if (diff < 0.1 && samePhase) {
          group.push(bioValues[j].name);
          used.add(j);
        }
      }

      if (group.length > 1) {
        used.add(i);
        const names = group.join(", ");
        let message = "";

        switch (bio.id) {
          case "physical":
            message = `⚡ ${names} синхронизированы физически. Подходящий день для совместной физической активности.`;
            break;
          case "emotional":
            message = `💖 ${names} эмоционально на одной волне. Общение может быть особенно тёплым.`;
            break;
          case "intellectual":
            message = `🧠 ${names} мыслят одинаково. Отличный момент для командной работы или обсуждений.`;
            break;
        }

        results.push(message);
      }
    }
  });

  correlationText.innerHTML = results.length
    ? results.map(r => `<p>${r}</p>`).join("")
    : "<p>Сегодня нет выраженных корреляций между участниками 🤔</p>";

  correlationModal.style.display = "flex";
});

personalBtn.addEventListener("click", () => {
  const targetDate = new Date(dateInput.value);
  const selectedPeople = people.filter(p =>
    document.querySelector(`.person-checkbox[value="${p.id}"]`)?.checked
  );
  const selectedBiorhythms = biorhythmTypes.filter(b =>
    document.querySelector(`.biorhythm-type[value="${b.id}"]`)?.checked
  );

  const recommendations = selectedPeople.map(p => {
    const days = calculateDays(p.birthday, targetDate);
    const bio = {};
    selectedBiorhythms.forEach(b => {
      bio[b.id] = calculateBiorhythm(days, b.cycle);
    });

    let text = `<p><strong>${p.name}:</strong></p>`;
    selectedBiorhythms.forEach(b => {
      const val = bio[b.id];
      const percent = Math.round(val * 100);
      let desc = "";

      if (val > 0.5) {
        desc = `высокий уровень ${b.name.toLowerCase()} — используйте этот потенциал!`;
      } else if (val < -0.5) {
        desc = `низкий уровень ${b.name.toLowerCase()} — лучше отдохнуть и не перегружаться.`;
      } else {
        desc = `сбалансированный ${b.name.toLowerCase()} — подходящий день для обычных дел.`;
      }

      text += `<p>${b.name}: <strong>${percent}%</strong> — ${desc}</p>`;
    });

    return text;
  });

  personalText.innerHTML = recommendations.join("<hr>");
  personalModal.style.display = "flex";
});

closeCorrelation.onclick = () => correlationModal.style.display = "none";
closePersonal.onclick = () => personalModal.style.display = "none";

window.addEventListener("click", (e) => {
  if (e.target === correlationModal) correlationModal.style.display = "none";
  if (e.target === personalModal) personalModal.style.display = "none";
});
