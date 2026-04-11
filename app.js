const passwordInput = document.getElementById("passwordInput");
const toggleVisibility = document.getElementById("toggleVisibility");
const meterFill = document.getElementById("meterFill");
const scoreValue = document.getElementById("scoreValue");
const ratingValue = document.getElementById("ratingValue");
const entropyValue = document.getElementById("entropyValue");
const suggestionsList = document.getElementById("suggestions");
const checklist = document.getElementById("checklist");

const COMMON_PASSWORDS = new Set([
  "password",
  "123456",
  "123456789",
  "qwerty",
  "abc123",
  "111111",
  "letmein",
  "admin",
  "welcome",
  "iloveyou",
]);

function hasSequential(text) {
  const sequences = [
    "0123456789",
    "abcdefghijklmnopqrstuvwxyz",
    "qwertyuiop",
    "asdfghjkl",
    "zxcvbnm",
  ];
  const value = text.toLowerCase();
  return sequences.some((seq) => {
    for (let i = 0; i < seq.length - 2; i += 1) {
      if (value.includes(seq.slice(i, i + 3))) return true;
    }
    return false;
  });
}

function hasRepeats(text) {
  return /(.)\1\1/.test(text);
}

function entropyBits(text) {
  let pool = 0;
  if (/[a-z]/.test(text)) pool += 26;
  if (/[A-Z]/.test(text)) pool += 26;
  if (/[0-9]/.test(text)) pool += 10;
  if (/[^A-Za-z0-9]/.test(text)) pool += 33;
  if (pool === 0) return 0;
  return Math.log2(pool) * text.length;
}

function labelFromScore(score) {
  if (score >= 80) return "Strong";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  if (score >= 20) return "Weak";
  return "Very Weak";
}

function updateChecklist(password) {
  const checks = {
    length: password.length >= 8,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };

  checklist.querySelectorAll("li").forEach((item) => {
    const key = item.getAttribute("data-check");
    item.classList.toggle("checked", checks[key]);
  });
}

function renderSuggestions(list) {
  suggestionsList.innerHTML = "";
  if (list.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Nice work. Consider 12+ characters for extra safety.";
    suggestionsList.appendChild(li);
    return;
  }
  list.forEach((tip) => {
    const li = document.createElement("li");
    li.textContent = tip;
    suggestionsList.appendChild(li);
  });
}

function evaluatePassword(password) {
  let score = 0;
  const feedback = [];

  if (password.length >= 12) score += 30;
  else if (password.length >= 10) score += 22;
  else if (password.length >= 8) score += 15;
  else if (password.length >= 6) score += 8;
  else feedback.push("Use at least 8 characters.");

  const classes = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
  score += classes * 10;

  if (!/[a-z]/.test(password)) feedback.push("Add lowercase letters.");
  if (!/[A-Z]/.test(password)) feedback.push("Add uppercase letters.");
  if (!/[0-9]/.test(password)) feedback.push("Add numbers.");
  if (!/[^A-Za-z0-9]/.test(password)) feedback.push("Add symbols (e.g., !@#$%).");

  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    score -= 35;
    feedback.push("Avoid common passwords.");
  }
  if (hasSequential(password)) {
    score -= 10;
    feedback.push("Avoid sequences like 123 or abc.");
  }
  if (hasRepeats(password)) {
    score -= 10;
    feedback.push("Avoid repeating characters (e.g., aaa).");
  }

  const entropy = entropyBits(password);
  score += Math.min(20, Math.floor(entropy / 5));
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    label: labelFromScore(score),
    entropy: entropy.toFixed(1),
    feedback,
  };
}

function handleInput() {
  const password = passwordInput.value;
  const result = evaluatePassword(password);

  meterFill.style.width = `${result.score}%`;
  scoreValue.textContent = result.score;
  ratingValue.textContent = result.label;
  entropyValue.textContent = `${result.entropy} bits`;

  updateChecklist(password);
  renderSuggestions(password ? result.feedback : ["Start typing to see feedback."]);
}

toggleVisibility.addEventListener("click", () => {
  const visible = passwordInput.type === "text";
  passwordInput.type = visible ? "password" : "text";
  toggleVisibility.textContent = visible ? "Show" : "Hide";
  passwordInput.focus();
});

passwordInput.addEventListener("input", handleInput);
