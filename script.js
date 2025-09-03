// Data storage
const numbers = [];
const numInput = document.getElementById("numInput");
const periodInput = document.getElementById("periodInput");
const tableBody = document.getElementById("tableBody");
const resultEl = document.getElementById("result");
// Re-added variables for prediction box
const predictionBoxContainer = document.getElementById(
    "prediction-box-container"
);
const predictedPeriodEl = document.getElementById("predicted-period");
const predictedValueEl = document.getElementById("predicted-value");

// Event Listeners
document.querySelector(".add-btn").addEventListener("click", addNumbers);

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
        const nextPeriod = numbers[0].periodNumber + 1;
        numInput.placeholder = `Next Period: ${nextPeriod}`;
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
    // Hide prediction box when new numbers are added
    predictionBoxContainer.style.display = "none";
    checkPeriodInputVisibility();
}

function updateTable() {
    tableBody.innerHTML = "";
    numbers.forEach((entry) => {
        const num = entry.value;
        const row = document.createElement("tr");

        const colorClass = num % 2 === 0 ? "red" : "green";
        const colorText = num % 2 === 0 ? "Red" : "Green";
        const sizeText = num <= 4 ? "SMALL" : "BIG";

        row.innerHTML = `
            <td>${entry.periodNumber}</td>
            <td class="${colorClass}" onclick="editNumber(${entry.periodNumber})">${num}</td>
            <td><span class="${colorClass}">${colorText}</span></td>
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
        // Hide prediction box after editing a number
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

function getMajority(arr) {
    let count = { R: 0, G: 0, S: 0, B: 0 };
    arr.forEach((v) => count[v]++);
    let majority = Object.entries(count).reduce((a, b) =>
        a[1] > b[1] ? a : b
    );
    return majority[1] > 0 ? majority[0] : null;
}

function getAlternateNext(seq) {
    if (seq.length < 2) return null;
    const last = seq[0];
    const secondLast = seq[1];
    return last !== secondLast ? secondLast : null;
}

function predict(type) {
    if (numbers.length < 20) {
        resultEl.textContent = "Enter at least 20 numbers to get a prediction.";
        predictionBoxContainer.style.display = "none"; // Hide prediction box
        return;
    }

    resultEl.textContent = "Analyzing...";
    resultEl.classList.add("loading");
    predictionBoxContainer.style.display = "none"; // Hide prediction box during analysis

    setTimeout(() => {
        let prediction = null;
        let logicUsed = "";
        const values = numbers.map((e) => e.value);
        const colors = values.map((n) => (n % 2 === 0 ? "R" : "G"));
        const sizes = values.map((n) => (n <= 4 ? "S" : "B"));

        if (type === "sequence") {
            prediction = getNextPattern(colors) || getNextPattern(sizes);
            logicUsed = "Sequence Logic";
        } else if (type === "majority") {
            prediction = getMajority(colors) || getMajority(sizes);
            logicUsed = "Majority Logic";
        } else if (type === "alternate") {
            prediction = getAlternateNext(colors) || getAlternateNext(sizes);
            logicUsed = "Alternate Logic";
        }

        resultEl.classList.remove("loading");

        if (prediction !== null) {
            let predictionText = "";
            let predictionClass = "";

            const isRedOrGreen =
                typeof prediction === "string" &&
                (prediction === "R" || prediction === "G");

            if (isRedOrGreen) {
                predictionText = prediction === "R" ? "Red" : "Green";
                predictionClass = prediction === "R" ? "red" : "green";
            } else {
                predictionText = prediction === "S" ? "SMALL" : "BIG";
            }

            const nextPeriod =
                numbers.length > 0 ? numbers[0].periodNumber + 1 : 1;
            resultEl.textContent = `${logicUsed} → Result: ${predictionText}`;
            updatePredictionBox(nextPeriod, predictionText, predictionClass);
        } else {
            predictionBoxContainer.style.display = "none";
            resultEl.textContent = `${logicUsed} → No clear prediction.`;
        }
    }, 1000);
}

function updatePredictionBox(period, predictionText, predictionClass = "") {
    predictedPeriodEl.textContent = period;
    predictedValueEl.textContent = predictionText;

    predictedValueEl.classList.remove("red", "green");
    if (predictionClass) {
        predictedValueEl.classList.add(predictionClass);
    }

    predictionBoxContainer.style.display = "flex";
}

function copyPrediction() {
    const period = predictedPeriodEl.textContent;
    const predictionValue = predictedValueEl.textContent;

    const formattedText = `╭⚬──────────────⚬╮
│ ⭐⭐ 51 GAMES ⭐⭐
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
