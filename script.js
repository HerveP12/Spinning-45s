document.addEventListener("DOMContentLoaded", () => {
  console.log("JS loaded and DOMContentLoaded event fired.");

  const winningNumberDisplay = document.getElementById("winning-number");
  const betSpots = document.querySelectorAll(".bet-spot");
  const chips = document.querySelectorAll(".chip");
  const timerDisplay = document.createElement("h2");
  const balanceDisplay = document.createElement("h2");
  document.body.prepend(balanceDisplay); // Add balance display to the top of the page
  document.body.prepend(timerDisplay); // Add timer display above the balance display

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
    single: 35, // 35:1 payout for single numbers
    "1st12": 2, // 2:1 payout for dozen bets
    "2nd12": 2,
    "3rd12": 2,
    "1-18": 1, // 1:1 payout for low/high, odd/even, red/black
    "19-36": 1,
    even: 1,
    odd: 1,
    red: 1,
    black: 1,
    "2to1-left": 2, // 2:1 payout for column bets
    "2to1-middle": 2,
    "2to1-right": 2,
  };

  let countdownTime = 10; // 10 seconds for placing bets
  let selectedChipValue = 1; // Default chip value
  let bets = {}; // Store bets placed on each spot
  let balance = 10000; // Starting balance

  // Update balance display
  function updateBalanceDisplay() {
    balanceDisplay.textContent = `Balance: $${balance}`;
  }

  // Initialize balance display
  updateBalanceDisplay();

  // Style the numbers dynamically
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

  // Select a chip value
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      selectedChipValue = parseInt(chip.dataset.value, 10);
      chips.forEach((c) => c.classList.remove("selected"));
      chip.classList.add("selected");
      console.log(`Selected chip value: $${selectedChipValue}`);
    });
  });

  // Place bets on the layout
  betSpots.forEach((spot) => {
    spot.addEventListener("click", () => {
      const spotKey = spot.dataset.number || spot.dataset.bet;

      // Initialize bet if not already placed
      if (!bets[spotKey]) bets[spotKey] = 0;
      bets[spotKey] += selectedChipValue;

      // Deduct from balance
      if (balance - selectedChipValue < 0) {
        alert("Not enough balance!");
        return;
      }
      balance -= selectedChipValue;

      // Visualize the chip on the spot
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
    });
  });

  // Randomly select a winning number
  function getRandomWinningNumber() {
    const randomIndex = Math.floor(Math.random() * wheelNumbers.length);
    return wheelNumbers[randomIndex];
  }

  // Resolve bets and calculate winnings
  function resolveBets(winningNumber) {
    console.log(`Resolving bets for winning number: ${winningNumber}`);
    betSpots.forEach((spot) => {
      spot.classList.remove("winner"); // Clear previous highlights
      const spotKey = spot.dataset.number || spot.dataset.bet;

      // If no bet was placed, ensure it is treated as zero
      const betAmount = bets[spotKey] || 0;

      // Highlight inside bets
      if (spotKey === winningNumber) {
        spot.classList.add("winner");
        balance += betAmount * (payouts.single + 1); // Add original bet and payout
      }

      // Highlight relevant outside bets
      if (redNumbers.includes(winningNumber) && spotKey === "red") {
        spot.classList.add("winner");
        balance += betAmount * (payouts.red + 1);
      } else if (blackNumbers.includes(winningNumber) && spotKey === "black") {
        spot.classList.add("winner");
        balance += betAmount * (payouts.black + 1);
      } else if (
        parseInt(winningNumber) % 2 === 0 &&
        parseInt(winningNumber) > 0 &&
        spotKey === "even"
      ) {
        spot.classList.add("winner");
        balance += betAmount * (payouts.even + 1);
      } else if (parseInt(winningNumber) % 2 !== 0 && spotKey === "odd") {
        spot.classList.add("winner");
        balance += betAmount * (payouts.odd + 1);
      } else if (
        parseInt(winningNumber) >= 1 &&
        parseInt(winningNumber) <= 18 &&
        spotKey === "1-18"
      ) {
        spot.classList.add("winner");
        balance += betAmount * (payouts["1-18"] + 1);
      } else if (
        parseInt(winningNumber) >= 19 &&
        parseInt(winningNumber) <= 36 &&
        spotKey === "19-36"
      ) {
        spot.classList.add("winner");
        balance += betAmount * (payouts["19-36"] + 1);
      }
    });

    updateBalanceDisplay();
  }

  // Countdown timer logic
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
        console.log(`Winning number: ${winningNumber}`);
        winningNumberDisplay.textContent = `Winning Number: ${winningNumber}`;
        resolveBets(winningNumber);

        // Reset the game after showing results
        setTimeout(() => {
          resetGame();
        }, 5000);
      }
    }, 1000);
  }

  // Reset the game for the next round
  function resetGame() {
    console.log("Resetting game...");
    countdownTime = 10; // Reset timer
    bets = {}; // Clear bets
    betSpots.forEach((spot) => {
      spot.classList.remove("winner");
      const chipIndicator = spot.querySelector(".chip-indicator");
      if (chipIndicator) chipIndicator.remove(); // Remove visual chips
    });
    winningNumberDisplay.textContent = "Winning Number: -";
    startCountdown(); // Start the next round
  }

  // Start the countdown for the first round
  startCountdown();
});
