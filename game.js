// Constants
const FPS = 60;
const WIDTH = 1280;
const HEIGHT = 720;

// Colors
const COLORS = {
    WHITE: "rgb(255, 255, 255)",
    BLACK: "rgb(0, 0, 0)",
    BROWN: "rgb(150, 75, 0)",
    RED: "rgb(255, 0, 0)",
    YELLOW: "rgb(255, 255, 0)",
    GREEN: "rgb(0, 255, 0)",
    BLUE: "rgb(0, 0, 255)",
    PURPLE: "rgb(100, 0, 100)"
};

// Layout
const LAYOUT = {
    START_BUTTON_SIZE: [600, 150],
    ANDREW_JOHNSON_SIZE: [300, 400],
    SENATOR_SIZE: [200, 200],
    PLAY_BUTTON_CENTER: [WIDTH / 2, HEIGHT / 2],
    NAME_PLATE_POS: [325, 450],
    IMAGE_POS: [250, 30],
    MAIN_TEXTBOX_POS: [750, 350],
    MAIN_TEXTBOX_TITLE_POS: [800, 250],
    BAR_POS: [20, 50],
    TEXT_POS: [300, 20],
    BUTTON_POS: [20, 120]
};

const COURT_STAND_POSITIONS = [
    [550, 250], [730, 255], [370, 255], [900, 270],
    [200, 270], [1070, 300], [20, 300]
];

// Texts
const INTRO_TEXT = "Welcome to Ace Impeachment.\nA game about impeaching Andrew Johnson\n\n\n\n\nClick to continue";

const EXPLANATION_TEXT = "Andrew Johnson was historically the first\npresident impeached.\n\nBut while impeached, Andrew Johnson\nwas never removed from office.\n\nYour goal is to change that.\n\nClick to continue";

const PRESIDENT_NAME = 'Andrew Johnson';

const COURTROOM_TEXTS = [
    "Welcome to the courtroom.\n\nThese three bars show the senators' bias.\nOnce a bar has reached one side, a decision will\nbe made.",
    "You might notice the top two bars are red and blue\nThis represents a bias to Impeachment (red)\nOr Not guilty (blue).\nDon't worry about the 3rd bar, it doesn't matter...",
    "\n\n     But that's enough reading, let's start!",
    "\n\n          Click one of the options below"
];

const BUTTON_OPTIONS_1 = [
    'He is nicknamed "The Tennessee Tailor," but he couldn\'t even sew up the rift between the North and South.',
    'He vetoed the Civil Rights Act of 1866, which aimed to give citizenship and equal rights to newly freed slaves.',
    'He pardoned Confederate soldiers and officials, letting them off the hook for their actions in the Civil War.',
    'He drank whiskey before delivering speeches, leading to some rather slurred and incoherent addresses.',
    'He attempted to remove Edwin Stanton as Secretary of War without Congressional approval.'
];

const BUTTON_OPTIONS_2 = [
    'He believed the Tenure of Office Act was unconstitutional.',
    'He vetoed several Reconstruction Acts that he felt were too harsh, trying to rejoin the two sides from the war.',
    'He has a sweet mustache that could make even the most hardened political opponent swoon.',
    'He made efforts to improve the economy and infrastructure of the South.',
    'He can lead this country to greatness given the chance.'
];

const BUTTON_OPTIONS_3 = [
    'He is a master of the veto, using it over 20 times during his presidency to show Congress who was boss.',
    'He is a talented tailor and could make a mean suit.',
    'He has a unique style of speaking, starting speeches with "fellow-citizens" and ending with "God bless you all!"'
];

const BUTTON_OPTIONS_4 = [
    'Option 4',
    'Do you like Star Wars?',
    'This is boring',
    'Why are we here again?',
    'Impeach Mr. Miskinis instead'
];

// Font mappings
const FONTS = {
    regular: "26px 'Monotype Corsiva', cursive",
    name: "30px 'alluraregular', cursive",
    title: "bold 32px Arial, sans-serif",
    button: "16px sans-serif"
};

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // State
        this.running = true;
        this.currentScene = 'title';
        this.tutorialStep = 0;

        // Bars: [Current Value, Color]
        this.republicanBar = [70, COLORS.RED];
        this.democratBar = [30, COLORS.BLUE];
        this.thirdPartyBar = [0, COLORS.GREEN];

        this.currentButtonTexts = [];
        this.randomizeButtons();

        this.assets = {};
        this.buttonRects = [];
        this.lastTime = 0;

        // Ending state
        this.endingStartTime = 0;
        this.endingBgColor = COLORS.BLACK;
        this.endingText = "";

        // Bind inputs
        this.canvas.addEventListener('mousedown', (e) => this.handleInput(e));

        this.loadAssets().then(() => {
            this.loop(0);
        });
    }

    async loadAssets() {
        const imageFiles = {
            'title_screen': 'TitleScreen.png',
            'court_single': 'CourtSingle.png',
            'court_stands': 'CourtStands.png',
            'play_button': 'start.gif',
            'andrew_johnson': 'andrewjohnson.gif',
            'red_senator': 'RedGuy.gif',
            'blue_senator': 'BlueGuy.gif'
        };

        const promises = Object.entries(imageFiles).map(([key, filename]) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = `assets/${filename}`;
                img.onload = () => {
                    this.assets[key] = img;
                    resolve();
                };
                img.onerror = () => {
                    console.error(`Failed to load ${filename}`);
                    // Resolve anyway to not break entire game, or handle error
                    resolve();
                };
            });
        });

        await Promise.all(promises);

        // Setup court people array
        this.courtPeopleImgs = [
            this.assets['red_senator'], this.assets['blue_senator'],
            this.assets['blue_senator'], this.assets['blue_senator'],
            this.assets['blue_senator'], this.assets['red_senator'],
            this.assets['blue_senator']
        ];
    }

    randomizeButtons() {
        this.currentButtonTexts = [
            BUTTON_OPTIONS_1[Math.floor(Math.random() * BUTTON_OPTIONS_1.length)],
            BUTTON_OPTIONS_2[Math.floor(Math.random() * BUTTON_OPTIONS_2.length)],
            BUTTON_OPTIONS_3[Math.floor(Math.random() * BUTTON_OPTIONS_3.length)],
            BUTTON_OPTIONS_4[Math.floor(Math.random() * BUTTON_OPTIONS_4.length)]
        ];
    }

    handleInput(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.currentScene === 'title') {
            // Check button collision (centered)
            const btnW = LAYOUT.START_BUTTON_SIZE[0];
            const btnH = LAYOUT.START_BUTTON_SIZE[1];
            const btnX = LAYOUT.PLAY_BUTTON_CENTER[0] - btnW / 2;
            const btnY = LAYOUT.PLAY_BUTTON_CENTER[1] - btnH / 2;

            if (x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {
                this.currentScene = 'tutorial_1';
                this.tutorialStep = 0;
            }

        } else if (this.currentScene === 'tutorial_1') {
            this.tutorialStep++;
            if (this.tutorialStep > 1) {
                this.currentScene = 'tutorial_2';
                this.tutorialStep = 0;
            }

        } else if (this.currentScene === 'tutorial_2') {
            this.tutorialStep++;
            if (this.tutorialStep >= COURTROOM_TEXTS.length - 1) {
                this.currentScene = 'court_session';
            }

        } else if (this.currentScene === 'court_session') {
            for (let i = 0; i < this.buttonRects.length; i++) {
                const b = this.buttonRects[i];
                if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
                    this.handleCourtChoice(i);
                    break;
                }
            }
        }
    }

    handleCourtChoice(index) {
        function randInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        if (index === 0) {
            this.republicanBar[0] += randInt(10, 20);
            this.democratBar[0] -= randInt(-5, 15);
            this.thirdPartyBar[0] -= randInt(-5, 15);
        } else if (index === 1) {
            this.republicanBar[0] -= randInt(-5, 15);
            this.democratBar[0] += randInt(10, 20);
            this.thirdPartyBar[0] -= randInt(-5, 15);
        } else if (index === 2) {
            this.republicanBar[0] -= randInt(-20, 20);
            this.democratBar[0] -= randInt(-20, 20);
            this.thirdPartyBar[0] -= randInt(-20, 20);
        } else if (index === 3) {
            this.republicanBar[0] -= randInt(-5, 25);
            this.democratBar[0] -= randInt(-5, 25);
            this.thirdPartyBar[0] += randInt(10, 25);
        }

        // Clamp
        [this.republicanBar, this.democratBar, this.thirdPartyBar].forEach(bar => {
            bar[0] = Math.max(0, Math.min(100, bar[0]));
        });

        // Check endings
        if (this.democratBar[0] >= 100) this.showEnding('no_impeach');
        else if (this.republicanBar[0] >= 100) this.showEnding('impeach');
        else if (this.thirdPartyBar[0] >= 100) this.showEnding('secret');

        this.randomizeButtons();
    }

    showEnding(type) {
        this.currentScene = 'ending';
        this.endingStartTime = Date.now();

        if (type === 'impeach') {
            this.endingBgColor = COLORS.RED;
            this.endingText = "And so Andrew Johnson was removed from office.\nThe world was normal until the sun blew up in 2012 because the Mayans were correct.\n\nSources:\nhttps://www.pbs.org/presidential/voices/\nhttps://www.nps.gov/anjo/learn/historyculture\nhttps://www.history.com/topics/american-civil-war/edwin-m-stanton";
        } else if (type === 'no_impeach') {
            this.endingBgColor = COLORS.BLUE;
            this.endingText = "And so President Andrew Johnson led the United States to a peace treaty,\nPeople slowly forgot about their differences and the world was at peace.\n(Please note this probably would never have happened with Andrew Johnson as president)\n\nThen world war 2 hit and the other side won.";
        } else if (type === 'secret') {
            this.endingBgColor = COLORS.PURPLE;
            this.endingText = "And so Mr. Miskinis noticed that this project was objectively the best project\nand decided to give Jason and William a 100% on the project.\n\n\nAnd Mr. Miskinis was impeached.";
        }
    }

    drawText(text, font, color, x, y, lineSpacing = 5, maxWidth = null) {
        this.ctx.font = font;
        this.ctx.fillStyle = color;

        const fontSize = parseInt(font, 10) || 20;
        const lineHeight = fontSize + lineSpacing;

        let lines = text.split('\n');

        // If maxWidth is provided, we need to wrap lines
        if (maxWidth) {
            let wrappedLines = [];
            for (let line of lines) {
                if (this.ctx.measureText(line).width > maxWidth) {
                    const words = line.split(' ');
                    let currentLine = '';

                    for (let n = 0; n < words.length; n++) {
                        const testLine = currentLine + words[n] + ' ';
                        const metrics = this.ctx.measureText(testLine);
                        const testWidth = metrics.width;
                        if (testWidth > maxWidth && n > 0) {
                            wrappedLines.push(currentLine);
                            currentLine = words[n] + ' ';
                        } else {
                            currentLine = testLine;
                        }
                    }
                    wrappedLines.push(currentLine);
                } else {
                    wrappedLines.push(line);
                }
            }
            lines = wrappedLines;
        }

        for (let i = 0; i < lines.length; i++) {
            this.ctx.fillText(lines[i], x, y + (i * lineHeight));
        }
    }

    drawButton(x, y, w, h, color, text, textColor) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, w, h);

        // Draw text centered
        this.ctx.font = FONTS.button;
        this.ctx.fillStyle = textColor;

        // We use the drawText logic but calculate Y to center it approximately
        // First estimate height of text block
        const fontSize = 16;
        const lineHeight = fontSize + 4;

        // Wrap text first to know how many lines
        let lines = [];
        const words = text.split(' ');
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = this.ctx.measureText(currentLine + " " + word).width;
            if (width < w - 20) { // 20px padding
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);

        const totalTextHeight = lines.length * lineHeight;
        let startY = y + (h - totalTextHeight) / 2 + fontSize / 1.2; // roughly center

        for (let line of lines) {
            const metrics = this.ctx.measureText(line);
            const tx = x + (w - metrics.width) / 2;
            this.ctx.fillText(line, tx, startY);
            startY += lineHeight;
        }

        return { x, y, w, h };
    }

    drawBar(x, y, w, h, value, color, name, showPercentage) {
        // Outline
        this.ctx.strokeStyle = COLORS.BLACK;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, w, h);

        // Fill
        const percentage = value / 100.0;
        const fillWidth = percentage * (w - 2);
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x + 1, y + 1, fillWidth, h - 2);

        // Name
        this.ctx.font = FONTS.button;
        this.ctx.fillStyle = COLORS.BLACK;
        const nameMetrics = this.ctx.measureText(name);
        const nx = x + (w - nameMetrics.width) / 2;
        const ny = y - 10;
        this.ctx.fillText(name, nx, ny);

        if (showPercentage) {
            const pctText = Math.floor(value) + "%";
            this.ctx.fillStyle = COLORS.BLACK; // Ensure visible
            const pctMetrics = this.ctx.measureText(pctText);
            const px = x + (w - pctMetrics.width) / 2;
            const py = y + h / 2 + 8;
            this.ctx.fillText(pctText, px, py);
        }
    }

    draw() {
        // Clear background
        this.ctx.fillStyle = COLORS.BLACK;
        this.ctx.fillRect(0, 0, WIDTH, HEIGHT);

        if (this.currentScene === 'title') {
            if (this.assets['title_screen']) {
                this.ctx.drawImage(this.assets['title_screen'], 0, 0, WIDTH, HEIGHT);
            }
            if (this.assets['play_button']) {
                const btnW = LAYOUT.START_BUTTON_SIZE[0];
                const btnH = LAYOUT.START_BUTTON_SIZE[1];
                const btnX = LAYOUT.PLAY_BUTTON_CENTER[0] - btnW / 2;
                const btnY = LAYOUT.PLAY_BUTTON_CENTER[1] - btnH / 2;
                this.ctx.drawImage(this.assets['play_button'], btnX, btnY, btnW, btnH);
            }

        } else if (this.currentScene === 'tutorial_1') {
            if (this.assets['court_single']) {
                this.ctx.drawImage(this.assets['court_single'], 0, 0, WIDTH, HEIGHT);
            }
            if (this.assets['andrew_johnson']) {
                this.ctx.drawImage(this.assets['andrew_johnson'], LAYOUT.IMAGE_POS[0], LAYOUT.IMAGE_POS[1], LAYOUT.ANDREW_JOHNSON_SIZE[0], LAYOUT.ANDREW_JOHNSON_SIZE[1]);
            }

            this.drawText(PRESIDENT_NAME, FONTS.name, COLORS.BLACK, LAYOUT.NAME_PLATE_POS[0], LAYOUT.NAME_PLATE_POS[1]);
            this.drawText("Ace Impeachment", FONTS.title, COLORS.BLACK, LAYOUT.MAIN_TEXTBOX_TITLE_POS[0], LAYOUT.MAIN_TEXTBOX_TITLE_POS[1]);

            const textToShow = this.tutorialStep <= 0 ? INTRO_TEXT : EXPLANATION_TEXT;
            // Use maxWidth for tutorial text to prevent runoff
            this.drawText(textToShow, FONTS.regular, COLORS.BLACK, LAYOUT.MAIN_TEXTBOX_POS[0], LAYOUT.MAIN_TEXTBOX_POS[1], 5, 450);

        } else if (this.currentScene === 'tutorial_2' || this.currentScene === 'court_session') {
            if (this.assets['court_stands']) {
                this.ctx.drawImage(this.assets['court_stands'], 0, 0, WIDTH, HEIGHT);
            }

            // People
            for (let i = 0; i < COURT_STAND_POSITIONS.length; i++) {
                const pos = COURT_STAND_POSITIONS[i];
                if (this.courtPeopleImgs[i]) {
                    this.ctx.drawImage(this.courtPeopleImgs[i], pos[0], pos[1], LAYOUT.SENATOR_SIZE[0], LAYOUT.SENATOR_SIZE[1]);
                }
            }

            // Bars
            this.drawBar(LAYOUT.BAR_POS[0], LAYOUT.BAR_POS[1], 270, 20, this.republicanBar[0], this.republicanBar[1], 'Bias', true);
            this.drawBar(LAYOUT.BAR_POS[0], LAYOUT.BAR_POS[1] + 20, 270, 20, this.democratBar[0], this.democratBar[1], '', true);
            this.drawBar(LAYOUT.BAR_POS[0], LAYOUT.BAR_POS[1] + 40, 270, 20, this.thirdPartyBar[0], this.thirdPartyBar[1], '', true);

            // Text
            let textIdx = 0;
            if (this.currentScene === 'tutorial_2') {
                textIdx = Math.min(this.tutorialStep, COURTROOM_TEXTS.length - 1);
                this.drawText(COURTROOM_TEXTS[textIdx], FONTS.regular, COLORS.WHITE, LAYOUT.TEXT_POS[0], LAYOUT.TEXT_POS[1], 5, 800);
            } else {
                this.drawText(COURTROOM_TEXTS[COURTROOM_TEXTS.length - 1], FONTS.regular, COLORS.WHITE, LAYOUT.TEXT_POS[0], LAYOUT.TEXT_POS[1], 5, 800);

                // Buttons
                this.buttonRects = [];
                for (let i = 0; i < 4; i++) {
                    const rect = this.drawButton(
                        LAYOUT.BUTTON_POS[0],
                        LAYOUT.BUTTON_POS[1] + i * 30,
                        880, 25,
                        COLORS.BROWN,
                        this.currentButtonTexts[i],
                        COLORS.BLACK
                    );
                    this.buttonRects.push(rect);
                }
            }

        } else if (this.currentScene === 'ending') {
            this.ctx.fillStyle = this.endingBgColor;
            this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
            this.drawText(this.endingText, FONTS.name, COLORS.BLACK, 50, 50);

            // 60 second timeout for restart or just stop
            if (Date.now() - this.endingStartTime > 60000) {
                // For web, maybe just show a 'Refresh to play again' text?
                this.drawText("Refresh to play again", FONTS.title, COLORS.BLACK, WIDTH / 2 - 200, HEIGHT / 2);
            }
        }
    }

    loop(timestamp) {
        if (!this.running) return;

        // Calculate delta if needed, but we mostly just draw
        this.draw();

        requestAnimationFrame((ts) => this.loop(ts));
    }
}

// Start game
window.onload = () => {
    new Game();
};
