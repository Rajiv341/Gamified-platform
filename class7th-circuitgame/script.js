document.addEventListener('DOMContentLoaded', () => {
    // --- Game State & Elements ---
    let currentLevel = 1;
    let currentQuestionIndex = 0;
    let score = 0;
    let isTransitioning = false; // To prevent multiple triggers

    const startScreen = document.getElementById('start-screen');
    const startBtn = document.getElementById('start-btn');
    const gameWrapper = document.getElementById('game-wrapper');

    const scoreDisplay = document.getElementById('score');
    const levelTitle = document.getElementById('level-title');
    const objectiveText = document.getElementById('objective');
    const toolbox = document.getElementById('toolbox');
    const workspace = document.getElementById('workspace');
    const muteBtn = document.getElementById('mute-btn');
    
    const bgMusic = document.getElementById('bg-music');
    // ... other audio elements

    const circuitComponents = new Map();
    let isMuted = true;
    bgMusic.volume = 0.3;

    // --- All Levels & Questions Data ---
    const levels = {
        1: [
            {
                title: "Level 1 - Question 1",
                objective: "Ek simple circuit banao jismein Battery, Switch, aur Bulb ho.",
                grid: "2 / 2", // rows / columns
                components: ['battery', 'bulb', 'switch', 'wire', 'wire'],
                check: (comps) => {
                    const battery = comps.find(c => c.type === 'battery');
                    const bulb = comps.find(c => c.type === 'bulb');
                    const switchComp = comps.find(c => c.type === 'switch');
                    if (battery && bulb && switchComp && switchComp.onState) {
                        bulb.element.classList.add('lit');
                        return true;
                    }
                    return false;
                }
            },
            {
                title: "Level 1 - Question 2",
                objective: "Sirf Battery aur Bulb ka istemal karke bulb jalao (bina switch ke).",
                grid: "1 / 2",
                components: ['battery', 'bulb', 'wire'],
                check: (comps) => {
                    const battery = comps.find(c => c.type === 'battery');
                    const bulb = comps.find(c => c.type === 'bulb');
                    if (battery && bulb) {
                        bulb.element.classList.add('lit');
                        return true;
                    }
                    return false;
                }
            },
            {
                title: "Level 1 - Question 3",
                objective: "Ek circuit banao jismein 2 Bulb series mein lage hon.",
                grid: "1 / 4",
                components: ['battery', 'bulb', 'bulb', 'wire', 'wire', 'wire'],
                check: (comps) => {
                    const battery = comps.find(c => c.type === 'battery');
                    const bulbs = comps.filter(c => c.type === 'bulb');
                    if (battery && bulbs.length === 2) {
                        bulbs.forEach(b => b.element.classList.add('lit'));
                        return true;
                    }
                    return false;
                }
            }
        ],
        2: [
            {
                title: "Level 2 - Question 1",
                objective: "Ek parallel circuit banao jismein 2 bulb hon.",
                grid: "2 / 3",
                components: ['battery', 'bulb', 'bulb', 'wire', 'wire', 'wire', 'wire'],
                check: (comps) => {
                    const battery = comps.find(c => c.type === 'battery');
                    const bulbs = comps.filter(c => c.type === 'bulb');
                    if (battery && bulbs.length === 2) {
                        bulbs.forEach(b => b.element.classList.add('lit'));
                        return true;
                    }
                    return false;
                }
            },
            {
                title: "Level 2 - Question 2",
                objective: "Ek series circuit ko theek karo. Ismein ek component missing hai.",
                grid: "1 / 4",
                components: ['wire'],
                setup: (placeFn) => {
                    placeFn(0, 'battery'); placeFn(1, 'bulb'); placeFn(3, 'bulb');
                },
                check: (comps) => {
                    if (comps.length === 4) {
                        comps.filter(c => c.type === 'bulb').forEach(b => b.element.classList.add('lit'));
                        return true;
                    }
                    return false;
                }
            },
            {
                title: "Level 2 - Question 3",
                objective: "Is circuit mein switch add karo taaki dono bulb control ho sakein.",
                grid: "1 / 4",
                components: ['switch', 'wire'],
                setup: (placeFn) => {
                    placeFn(0, 'battery'); placeFn(2, 'bulb'); placeFn(3, 'bulb');
                },
                check: (comps) => {
                    const switchComp = comps.find(c => c.type === 'switch');
                    if (switchComp && switchComp.onState && comps.length >= 4) {
                         comps.filter(c => c.type === 'bulb').forEach(b => b.element.classList.add('lit'));
                         return true;
                    }
                    return false;
                }
            }
        ],
        3: [
            {
                title: "Level 3 - Question 1",
                objective: "Ek combination circuit banao: 2 bulb series mein, aur 1 unke parallel mein.",
                grid: "3 / 3",
                components: ['battery', 'bulb', 'bulb', 'bulb', 'wire', 'wire', 'wire', 'wire', 'wire'],
                check: (comps) => {
                    const battery = comps.find(c => c.type === 'battery');
                    const bulbs = comps.filter(c => c.type === 'bulb');
                    if (battery && bulbs.length === 3) {
                         bulbs.forEach(b => b.element.classList.add('lit'));
                         return true;
                    }
                    return false;
                }
            },
            {
                title: "Level 3 - Question 2",
                objective: "2 switches se 2 alag-alag bulb control karo.",
                grid: "2 / 4",
                components: ['battery', 'bulb', 'bulb', 'switch', 'switch', 'wire', 'wire', 'wire', 'wire'],
                check: (comps) => {
                    const bulbs = comps.filter(c => c.type === 'bulb');
                    const switches = comps.filter(c => c.type === 'switch');
                    if (bulbs.length === 2 && switches.length === 2) {
                        if(switches.every(s => s.onState)) {
                            bulbs.forEach(b => b.element.classList.add('lit'));
                            return true;
                        }
                    }
                    return false;
                }
            },
            {
                title: "Level 3 - Question 3",
                objective: "Circuit mein short-circuit hai. Extra wire ko hatao.",
                grid: "2 / 2",
                components: [],
                setup: (placeFn) => {
                    placeFn(0, 'battery'); placeFn(1, 'bulb'); placeFn(2, 'wire'); placeFn(3, 'wire', true);
                },
                check: (comps) => {
                    if (comps.length === 3 && !comps.find(c => c.isExtra)) {
                        comps.find(c => c.type === 'bulb').element.classList.add('lit');
                        return true;
                    }
                    return false;
                }
            }
        ]
    };

    // --- Start Game Logic ---
    startBtn.addEventListener('click', () => {
        startScreen.style.display = 'none';
        gameWrapper.style.display = 'flex';
        isMuted = false; 
        muteBtn.textContent = '🔇 Unmute';
        bgMusic.play().catch(e => console.log("Audio play failed."));
        loadQuestion();
    });

    // --- Audio Control ---
    muteBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        bgMusic.muted = isMuted;
        muteBtn.textContent = isMuted ? '🔊 Mute' : '🔇 Unmute';
    });

    function loadQuestion() {
        isTransitioning = false; // Reset transition lock
        const levelData = levels[currentLevel];
        if (!levelData || !levelData[currentQuestionIndex]) {
            objectiveText.textContent = "Congratulations! You've completed all levels!";
            workspace.innerHTML = '';
            toolbox.innerHTML = '<h3>Components</h3>';
            return;
        }

        const questionData = levelData[currentQuestionIndex];
        
        levelTitle.textContent = questionData.title;
        objectiveText.textContent = questionData.objective;
        
        workspace.innerHTML = '';
        circuitComponents.clear();
        const [rows, cols] = questionData.grid.split(' / ');
        workspace.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        workspace.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        for (let i = 0; i < rows * cols; i++) {
            const zone = document.createElement('div');
            zone.classList.add('drop-zone');
            zone.dataset.zoneId = i;
            workspace.appendChild(zone);
        }

        toolbox.innerHTML = '<h3>Components</h3>';
        questionData.components.forEach((type, index) => {
            const toolComp = document.createElement('div');
            toolComp.classList.add('component');
            toolComp.dataset.type = type;
            toolComp.id = `${type}-tool-${index}`;
            toolComp.draggable = true;
            toolbox.appendChild(toolComp);
        });

        if (questionData.setup) {
            questionData.setup(placeComponent);
        }
        checkCircuit();
    }
    
    function placeComponent(zoneId, type, isExtra = false) {
        const zone = workspace.querySelector(`[data-zone-id='${zoneId}']`);
        if(zone) {
            const comp = document.createElement('div');
            comp.classList.add('component');
            comp.dataset.type = type;
            comp.id = `${type}-${zoneId}`;
            comp.draggable = true;
            zone.appendChild(comp);
            const compData = { type, element: comp, onState: false, isExtra };
            circuitComponents.set(zoneId, compData);
            addListenersToComponent(comp);
        }
    }

    function proceedToNextQuestion() {
        score += 100;
        scoreDisplay.textContent = score;
        currentQuestionIndex++;
        if (currentQuestionIndex >= levels[currentLevel].length) {
            currentLevel++;
            currentQuestionIndex = 0;
        }
        loadQuestion();
    }

    function checkCircuit() {
        if (isTransitioning) return; // Agar level change ho raha hai to check na karein

        workspace.querySelectorAll('.lit').forEach(el => el.classList.remove('lit'));
        const levelData = levels[currentLevel];
        if (!levelData || !levelData[currentQuestionIndex]) return;

        const questionCheck = levelData[currentQuestionIndex].check;
        const componentsInWorkspace = Array.from(circuitComponents.values());
        const circuitWorking = questionCheck(componentsInWorkspace);

        if (circuitWorking) {
            isTransitioning = true;
            objectiveText.textContent = "Correct! Well done!";
            setTimeout(proceedToNextQuestion, 2000); // 2 second baad automatic aage badhega
        }
    }
    
    // --- Drag & Drop and Component Logic ---
    let draggedItem = null;

    document.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('component')) {
            draggedItem = e.target;
            setTimeout(() => e.target.style.opacity = '0.5', 0);
        }
    });

    document.addEventListener('dragend', (e) => {
        if (draggedItem) {
            draggedItem.style.opacity = '1';
            draggedItem = null;
        }
    });

    workspace.addEventListener('dragover', e => e.preventDefault());

    workspace.addEventListener('drop', (e) => {
        e.preventDefault();
        const dropZone = e.target.closest('.drop-zone');
        if (dropZone && draggedItem && !dropZone.hasChildNodes()) {
            const zoneId = parseInt(dropZone.dataset.zoneId);
            const isFromToolbox = draggedItem.id.includes('-tool-');

            if (isFromToolbox) {
                const type = draggedItem.dataset.type;
                const newComp = draggedItem.cloneNode(true);
                newComp.id = `${type}-${zoneId}`;
                dropZone.appendChild(newComp);
                const compData = { type, element: newComp, onState: false };
                circuitComponents.set(zoneId, compData);
                addListenersToComponent(newComp);
            } else {
                const originalZoneId = parseInt(draggedItem.parentElement.dataset.zoneId);
                dropZone.appendChild(draggedItem);
                const compData = circuitComponents.get(originalZoneId);
                circuitComponents.delete(originalZoneId);
                circuitComponents.set(zoneId, compData);
            }
            checkCircuit();
        }
    });

    function addListenersToComponent(componentElement) {
        if (componentElement.dataset.type === 'switch') {
            componentElement.addEventListener('click', () => {
                if (isTransitioning) return; // Prevent clicking during transition
                const zoneId = parseInt(componentElement.parentElement.dataset.zoneId);
                const compData = circuitComponents.get(zoneId);
                if (compData) {
                    compData.onState = !compData.onState;
                    componentElement.classList.toggle('on', compData.onState);
                    checkCircuit();
                }
            });
        }
    }
});