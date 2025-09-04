// Data storage
const numbers = [];
const numInput = document.getElementById("numInput");
const periodInput = document.getElementById("periodInput");
const tableBody = document.getElementById("tableBody");
const resultEl = document.getElementById("result");
const predictionBoxContainer = document.getElementById(
    "prediction-box-container"
);
const predictedPeriodEl = document.getElementById("predicted-period");
const predictedValueEl = document.getElementById("predicted-value");
const addBtn = document.querySelector(".add-btn");

// Event Listeners
addBtn.addEventListener("click", addNumbers);

// Initial setup
checkPeriodInputVisibility();

numInput.addEventListener("input", function () {
    let cleaned = this.value.replace(/\D/g, "");
    this.value = cleaned.split("").join(" ");
});

numInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") addNumbers();
});

function checkPeriodInputVisibility() {
    if (numbers.length === 0) {
        periodInput.style.display = "inline-block";
        numInput.placeholder = "e.g. 2378";
    } else {
        periodInput.style.display = "none";
        const nextPeriod = numbers.length > 0 ? numbers[0].periodNumber + 1 : 1;
        numInput.placeholder = `Next Period:Result num`;
    }
}

function addNumbers() {
    const values = numInput.value.trim().split(/\s+/).map(Number);
    const valid = values.filter((n) => !isNaN(n) && n >= 0 && n <= 9);

    if (numInput.value.trim() === "" || valid.length === 0) {
        alert("Please enter a number.");
        return;
    }

    let startPeriod;
    if (numbers.length === 0) {
        const enteredPeriod = parseInt(periodInput.value);
        if (isNaN(enteredPeriod) || enteredPeriod <= 0) {
            alert("Please enter a valid starting period number.");
            return;
        }
        startPeriod = enteredPeriod;
    } else {
        startPeriod = numbers[0].periodNumber + 1;
    }

    let newEntries = [];
    valid.forEach((num, i) => {
        const periodNumber = startPeriod + i;
        newEntries.unshift({ value: num, periodNumber: periodNumber });
    });

    numbers.unshift(...newEntries);
    if (numbers.length > 20) {
        numbers.splice(20);
    }

    numInput.value = "";
    updateTable();
    predictionBoxContainer.style.display = "none";
    checkPeriodInputVisibility();
}

function updateTable() {
    tableBody.innerHTML = "";
    numbers.forEach((entry) => {
        const num = entry.value;
        const row = document.createElement("tr");

        let colorText, numColorClass;
        if (num === 0 || num === 5) {
            colorText = "Purple";
            numColorClass = "purple-text";
        } else if (num % 2 === 0) {
            colorText = "Red";
            numColorClass = "red-text";
        } else {
            colorText = "Green";
            numColorClass = "green-text";
        }

        const sizeText = num <= 4 ? "SMALL" : "BIG";

        row.innerHTML = `
            <td>${entry.periodNumber}</td>
            <td class="${numColorClass}" onclick="editNumber(${
            entry.periodNumber
        })">${num}</td>
            <td><span class="${colorText.toLowerCase()}">${colorText}</span></td>
            <td>${sizeText}</td>
        `;
        tableBody.appendChild(row);
    });
}

function editNumber(periodNumber) {
    const entry = numbers.find((e) => e.periodNumber === periodNumber);
    if (!entry) return;

    const newValue = prompt("Enter new number (0–9):", entry.value);
    const n = parseInt(newValue);
    if (!isNaN(n) && n >= 0 && n <= 9) {
        entry.value = n;
        updateTable();
        predictionBoxContainer.style.display = "none";
    } else {
        alert("Invalid number.");
    }
}

// --- Prediction Logic Functions ---
function getNextPattern(seq) {
    for (let i = 3; i <= 6; i++) {
        const lastPattern = seq.slice(0, i).join("");
        for (let j = 1; j < seq.length - i; j++) {
            const comparePattern = seq.slice(j, j + i).join("");
            if (comparePattern === lastPattern && seq[j + i]) {
                return seq[j + i];
            }
        }
    }
    return null;
}

function getWeightedMajority(arr) {
    if (arr.length === 0) return null;
    const weightedCounts = {};
    arr.forEach((item, index) => {
        const weight = 10 - index;
        weightedCounts[item] = (weightedCounts[item] || 0) + weight;
    });

    const sorted = Object.entries(weightedCounts).sort((a, b) => b[1] - a[1]);
    return sorted[0][0];
}

function smartPredict() {
    if (numbers.length < 20) {
        resultEl.textContent = "Enter at least 20 numbers to get a prediction.";
        predictionBoxContainer.style.display = "none";
        return;
    }

    resultEl.textContent = "Analyzing...";
    resultEl.classList.add("loading");
    predictionBoxContainer.style.display = "none";

    setTimeout(() => {
        let prediction = null;
        let logicUsed = "";

        const recentEntries = numbers.slice(0, 10);
        const values = recentEntries.map((e) => e.value);

        const colors = values.map((n) => {
            if (n === 0 || n === 5) return "P";
            return n % 2 === 0 ? "G" : "R";
        });

        const sizes = values.map((n) => (n <= 4 ? "S" : "B"));

        // Step 1: Try Sequence Logic
        prediction = getNextPattern(colors) || getNextPattern(sizes);
        if (prediction) {
            logicUsed = "Sequence Logic";
        }

        // Step 2: Fallback to Majority Logic if no pattern found
        if (!prediction) {
            const dominantColor = getWeightedMajority(colors);
            const dominantSize = getWeightedMajority(sizes);

            // Prioritize color prediction
            prediction = dominantColor;
            logicUsed = "Weighted Majority Logic (Color)";

            // Fallback to size if no color prediction
            if (prediction === null) {
                prediction = dominantSize;
                logicUsed = "Weighted Majority Logic (Size)";
            }
        }

        // Step 3: Final fallback to Alternate Logic
        if (!prediction && colors.length > 1) {
            prediction = colors[1];
            logicUsed = "Alternate Logic";
        }

        resultEl.classList.remove("loading");

        if (prediction !== null) {
            let predictionText = "";
            let predictionClass = "";

            if (prediction === "R") {
                predictionText = "Red";
                predictionClass = "red";
            } else if (prediction === "G") {
                predictionText = "Green";
                predictionClass = "green";
            } else if (prediction === "P") {
                predictionText = "Purple";
                predictionClass = "purple";
            } else {
                predictionText = prediction === "S" ? "SMALL" : "BIG";
            }

            const nextPeriod =
                numbers.length > 0 ? numbers[0].periodNumber + 1 : 1;
            resultEl.textContent = `${logicUsed} → Result: ${predictionText}`;
            updatePredictionBox(nextPeriod, predictionText, predictionClass);
        } else {
            predictionBoxContainer.style.display = "none";
            resultEl.textContent = `No clear prediction found.`;
        }
    }, 1000);
}

function updatePredictionBox(period, predictionText, predictionClass = "") {
    predictedPeriodEl.textContent = period;
    predictedValueEl.textContent = predictionText;

    predictedValueEl.classList.remove("red", "green", "purple");
    if (predictionClass) {
        predictedValueEl.classList.add(predictionClass);
    }

    predictionBoxContainer.style.display = "flex";
}

function copyPrediction() {
    const period = predictedPeriodEl.textContent;
    const predictionValue = predictedValueEl.textContent;

    const formattedText = `╭⚬──────────────⚬╮
│ ....⭐ 1 MinWinGo ⭐....
│⚬───────────────⚬
│🎯WINGO : 1MinWinGo
│⏳PERIOD : ${period}
│🔮PREDICTION : ${predictionValue}
╰⚬──────────────⚬╯`;

    navigator.clipboard
        .writeText(formattedText)
        .then(() => {
            alert("Prediction copied to clipboard!");
        })
        .catch((err) => {
            console.error("Failed to copy text: ", err);
            alert(
                "Failed to copy. Your browser may not support this feature or permission was denied."
            );
        });
}
