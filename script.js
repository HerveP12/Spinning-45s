document.addEventListener("DOMContentLoaded", () => {
  console.log("JS loaded and DOMContentLoaded event fired.");

  const winningNumberDisplay = document.getElementById("winning-number");
  const betSpots = document.querySelectorAll(".bet-spot");
  const chips = document.querySelectorAll(".chip");
  const timerDisplay = document.createElement("h2");
  const balanceDisplay = document.createElement("h2");
  const spinning45sCounterDisplay = document.createElement("div");
  spinning45sCounterDisplay.id = "spinning-45s-counter-display";
  document.body.prepend(balanceDisplay);
  document.body.prepend(timerDisplay);
  document.body.prepend(spinning45sCounterDisplay);

  // Toggle button and rules container
  const rulesToggle = document.getElementById("rules-toggle");
  const rulesContainer = document.getElementById("rules-container");

  // Toggle the visibility of the rules container
  rulesToggle.addEventListener("click", () => {
    if (
      rulesContainer.style.display === "none" ||
      !rulesContainer.style.display
    ) {
      rulesContainer.style.display = "block";
      rulesToggle.textContent = "Hide Rules";
    } else {
      rulesContainer.style.display = "none";
      rulesToggle.textContent = "Show Rules";
    }
  });

  const wheelNumbers = [
    "00",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
    "21",
    "22",
    "23",
    "24",
    "25",
    "26",
    "27",
    "28",
    "29",
    "30",
    "31",
    "32",
    "33",
    "34",
    "35",
    "36",
  ];

  const redNumbers = [
    "1",
    "3",
    "5",
    "7",
    "9",
    "12",
    "14",
    "16",
    "18",
    "19",
    "21",
    "23",
    "25",
    "27",
    "30",
    "32",
    "34",
    "36",
  ];

  const blackNumbers = [
    "2",
    "4",
    "6",
    "8",
    "10",
    "11",
    "13",
    "15",
    "17",
    "20",
    "22",
    "24",
    "26",
    "28",
    "29",
    "31",
    "33",
    "35",
  ];

  const payouts = {
    single: 35, // Straight
    split: 17,
    street: 11,
    corner: 8,
    line: 5,
    color: 1, // Red/Black
    oddEven: 1, // Odd/Even
    highLow: 1, // High (19-36) / Low (1-18)
    dozen: 2, // Dozen (1-12, 13-24, 25-36)
    column: 2, // Column
    spinning45s: 10, // Payout for hitting exactly 45
  };

  let countdownTime = 10;
  let selectedChipValue = 1;
  let bets = {};
  let balance = 10000;
  let spinning45sCounter = 0;
  let spinning45sActive = false;

  function updateBalanceDisplay() {
    balanceDisplay.textContent = `Balance: $${balance}`;
  }

  function updateSpinning45sCounter(state = "active") {
    if (state === "active") {
      spinning45sCounterDisplay.innerHTML = `<h2 style="color: orange;">Spinning 45s Counter: ${spinning45sCounter}</h2>`;
    } else if (state === "win") {
      spinning45sCounterDisplay.innerHTML = `<h2 style="color: green;">Spinning 45s WON! Counter Reset.</h2>`;
    } else if (state === "lost") {
      spinning45sCounterDisplay.innerHTML = `<h2 style="color: red;">Spinning 45s LOST! Counter Reset.</h2>`;
    }
  }

  updateBalanceDisplay();
  updateSpinning45sCounter();

  // Style numbers dynamically
  betSpots.forEach((spot) => {
    const number = spot.dataset.number;

    if (number === "0" || number === "00") {
      spot.style.backgroundColor = "green";
      spot.style.color = "white";
    } else if (redNumbers.includes(number)) {
      spot.style.backgroundColor = "red";
      spot.style.color = "white";
    } else if (blackNumbers.includes(number)) {
      spot.style.backgroundColor = "black";
      spot.style.color = "white";
    }
  });

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      selectedChipValue = parseInt(chip.dataset.value, 10);
      chips.forEach((c) => c.classList.remove("selected"));
      chip.classList.add("selected");
      console.log(`Selected chip value: $${selectedChipValue}`);
    });
  });

  betSpots.forEach((spot) => {
    spot.addEventListener("click", () => {
      const spotKey = spot.dataset.number || spot.dataset.bet;

      // Restrict additional bets only if the counter is active
      if (spotKey === "spinning45s" && spinning45sActive) {
        alert(
          "Spinning 45s bet is already active. Please wait for it to resolve."
        );
        return;
      }

      // Initialize the bet amount if not already set
      if (!bets[spotKey]) bets[spotKey] = 0;

      // Check if there's enough balance for the bet
      if (balance - selectedChipValue < 0) {
        alert("Not enough balance!");
        return;
      }

      // Deduct balance and update the bet
      bets[spotKey] += selectedChipValue;
      balance -= selectedChipValue;

      // Update chip indicator for the spot
      let chipIndicator = spot.querySelector(".chip-indicator");
      if (!chipIndicator) {
        chipIndicator = document.createElement("div");
        chipIndicator.className = "chip-indicator";
        spot.appendChild(chipIndicator);
      }
      chipIndicator.textContent = `$${bets[spotKey]}`;
      console.log(
        `Placed $${selectedChipValue} on ${spotKey}, total: $${bets[spotKey]}`
      );
      updateBalanceDisplay();

      // Log the initial bet placement
      if (spotKey === "spinning45s") {
        console.log("Spinning 45s initial bet placed.");
      }
    });
  });

  function highlightWinningSpots(winningNumber) {
    betSpots.forEach((spot) => {
      spot.classList.remove("winner");
      const spotKey = spot.dataset.number || spot.dataset.bet;

      if (spotKey === winningNumber) {
        spot.classList.add("winner");
      }

      if (
        (redNumbers.includes(winningNumber) && spotKey === "red") ||
        (blackNumbers.includes(winningNumber) && spotKey === "black") ||
        (parseInt(winningNumber) >= 1 &&
          parseInt(winningNumber) <= 18 &&
          spotKey === "1-18") ||
        (parseInt(winningNumber) >= 19 &&
          parseInt(winningNumber) <= 36 &&
          spotKey === "19-36") ||
        (parseInt(winningNumber) % 2 === 0 &&
          parseInt(winningNumber) > 0 &&
          spotKey === "even") ||
        (parseInt(winningNumber) % 2 !== 0 && spotKey === "odd")
      ) {
        spot.classList.add("winner");
      }
    });
  }

  function resolveSpinning45s(winningNumber) {
    const value = parseInt(winningNumber) || 0;

    // Activate spinning45s logic after the first spin
    if (bets["spinning45s"] && !spinning45sActive) {
      spinning45sActive = true;
      console.log("Spinning 45s bet is now active.");
    }

    spinning45sCounter += value;

    if (value === 0 && spinning45sActive) {
      balance += bets["spinning45s"] * 2;
      console.log("Spinning 45s: Hit 0 or 00. Bet remains active.");
    } else if (spinning45sCounter === 45) {
      if (spinning45sActive) {
        balance += bets["spinning45s"] * (payouts.spinning45s + 1);
        console.log("Spinning 45s: Counter hit exactly 45. Bet won!");
      }
      spinning45sCounter = 0;
      spinning45sActive = false;
      bets["spinning45s"] = 0;
      updateSpinning45sCounter("win");
    } else if (spinning45sCounter > 45) {
      spinning45sCounter = 0;
      spinning45sActive = false;
      bets["spinning45s"] = 0;
      updateSpinning45sCounter("lost");
      console.log("Spinning 45s: Counter exceeded 45. Bet lost.");
    } else {
      updateSpinning45sCounter("active");
      console.log(
        `Spinning 45s: Counter updated to ${spinning45sCounter}. Bet still active.`
      );
    }

    updateBalanceDisplay();
  }

  function resolveBets(winningNumber) {
    highlightWinningSpots(winningNumber);
    resolveSpinning45s(winningNumber);

    betSpots.forEach((spot) => {
      const spotKey = spot.dataset.number || spot.dataset.bet;
      const betAmount = bets[spotKey] || 0;

      if (betAmount > 0) {
        if (spotKey === winningNumber) {
          // Straight Bet (Single Number)
          balance += betAmount * (payouts.single + 1);
        } else if (
          (redNumbers.includes(winningNumber) && spotKey === "red") ||
          (blackNumbers.includes(winningNumber) && spotKey === "black")
        ) {
          // Red or Black Bet
          balance += betAmount * (payouts.color + 1);
        } else if (
          spotKey === "1-18" &&
          parseInt(winningNumber) >= 1 &&
          parseInt(winningNumber) <= 18
        ) {
          // Low Bet (1-18)
          balance += betAmount * (payouts.highLow + 1);
        } else if (
          spotKey === "19-36" &&
          parseInt(winningNumber) >= 19 &&
          parseInt(winningNumber) <= 36
        ) {
          // High Bet (19-36)
          balance += betAmount * (payouts.highLow + 1);
        } else if (
          spotKey === "even" &&
          parseInt(winningNumber) > 0 &&
          parseInt(winningNumber) % 2 === 0
        ) {
          // Even Bet
          balance += betAmount * (payouts.oddEven + 1);
        } else if (spotKey === "odd" && parseInt(winningNumber) % 2 !== 0) {
          // Odd Bet
          balance += betAmount * (payouts.oddEven + 1);
        } else if (
          spotKey === "1st12" &&
          parseInt(winningNumber) >= 1 &&
          parseInt(winningNumber) <= 12
        ) {
          // 1st Dozen Bet
          balance += betAmount * (payouts.dozen + 1);
        } else if (
          spotKey === "2nd12" &&
          parseInt(winningNumber) >= 13 &&
          parseInt(winningNumber) <= 24
        ) {
          // 2nd Dozen Bet
          balance += betAmount * (payouts.dozen + 1);
        } else if (
          spotKey === "3rd12" &&
          parseInt(winningNumber) >= 25 &&
          parseInt(winningNumber) <= 36
        ) {
          // 3rd Dozen Bet
          balance += betAmount * (payouts.dozen + 1);
        } else if (
          spotKey === "2to1-left" &&
          [
            "3",
            "6",
            "9",
            "12",
            "15",
            "18",
            "21",
            "24",
            "27",
            "30",
            "33",
            "36",
          ].includes(winningNumber)
        ) {
          // Left Column Bet
          balance += betAmount * (payouts.column + 1);
        } else if (
          spotKey === "2to1-middle" &&
          [
            "2",
            "5",
            "8",
            "11",
            "14",
            "17",
            "20",
            "23",
            "26",
            "29",
            "32",
            "35",
          ].includes(winningNumber)
        ) {
          // Middle Column Bet
          balance += betAmount * (payouts.column + 1);
        } else if (
          spotKey === "2to1-right" &&
          [
            "1",
            "4",
            "7",
            "10",
            "13",
            "16",
            "19",
            "22",
            "25",
            "28",
            "31",
            "34",
          ].includes(winningNumber)
        ) {
          // Right Column Bet
          balance += betAmount * (payouts.column + 1);
        }
      }
    });

    updateBalanceDisplay();
  }

  function getRandomWinningNumber() {
    const randomIndex = Math.floor(Math.random() * wheelNumbers.length);
    return wheelNumbers[randomIndex];
  }

  function startCountdown() {
    timerDisplay.textContent = `Place your bets! Time left: ${countdownTime}s`;
    const timerInterval = setInterval(() => {
      countdownTime -= 1;
      if (countdownTime > 0) {
        timerDisplay.textContent = `Place your bets! Time left: ${countdownTime}s`;
      } else {
        clearInterval(timerInterval);
        timerDisplay.textContent = "No more bets!";
        const winningNumber = getRandomWinningNumber();
        winningNumberDisplay.textContent = `Winning Number: ${winningNumber}`;
        resolveBets(winningNumber);
        setTimeout(() => resetGame(), 5000);
      }
    }, 1000);
  }

  function resetGame() {
    countdownTime = 10;

    Object.keys(bets).forEach((key) => {
      if (key !== "spinning45s") bets[key] = 0;
    });

    if (!spinning45sActive) {
      spinning45sCounter = 0;
      updateSpinning45sCounter("active");
    }

    betSpots.forEach((spot) => {
      const chipIndicator = spot.querySelector(".chip-indicator");
      if (chipIndicator && !bets[spot.dataset.bet]) chipIndicator.remove();
      spot.classList.remove("winner");
    });

    winningNumberDisplay.textContent = "Winning Number: -";
    startCountdown();
  }

  startCountdown();
});
