/* =========================================================
   ITUS102 - Practical 3
   JavaScript Fundamentals - Secure Bank Ltd. Banking Utilities
   Concepts: variables, operators, conditionals, loops, functions
   ========================================================= */

"use strict";

/* ---------------------------------------------------------
   Constants (const) - values that never change
   --------------------------------------------------------- */
const MIN_AGE = 21;
const MAX_AGE = 60;
const MIN_INCOME = 15000;
const MAX_EMI_RATIO = 0.5;       // total EMIs must be <= 50% of income
const BASE_LOAN_RATE = 9.5;      // annual % for good credit
const HIGH_LOAN_RATE = 12.5;     // annual % for fair credit

/* ---------------------------------------------------------
   Helper functions (reusable, with parameters and return values)
   --------------------------------------------------------- */

// Read a number from an input control (returns NaN if empty/invalid)
function getNumber(id) {
  const value = document.getElementById(id).value.trim();
  return value === "" ? NaN : Number(value);
}

// Format a number as Indian Rupees with 2 decimals
function formatMoney(amount) {
  return "₹" + amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Display HTML content inside an output element
function showOutput(id, html) {
  document.getElementById(id).innerHTML = html;
}

/* =========================================================
   1. VARIABLES AND SCOPE DEMO (var, let, const)
   ========================================================= */
function runScopeDemo() {
  const lines = [];   // const array: reference cannot change, contents can

  // ---- var: function scoped, hoisted ----
  lines.push("--- var (function scope) ---");
  lines.push("Before declaration, hoisted var value: " + typeof hoistedVar);  // "undefined"
  var hoistedVar = "I am var";

  if (true) {
    var insideBlockVar = "declared with var inside block";
  }
  lines.push("var accessible outside block: " + insideBlockVar);

  // ---- let: block scoped ----
  lines.push("");
  lines.push("--- let (block scope) ---");
  if (true) {
    let insideBlockLet = "declared with let inside block";
    lines.push("Inside block: " + insideBlockLet);
  }
  try {
    // This will throw a ReferenceError because let is block scoped
    lines.push(insideBlockLet);
  } catch (error) {
    lines.push("Outside block: " + error.name + " - let is not accessible here");
  }

  // let can be reassigned
  let balance = 1000;
  balance = balance + 500;
  lines.push("let balance reassigned: " + balance);

  // ---- const: block scoped, cannot be reassigned ----
  lines.push("");
  lines.push("--- const (cannot be reassigned) ---");
  const BANK_NAME = "Secure Bank";
  try {
    BANK_NAME = "Other Bank";   // TypeError in strict mode
  } catch (error) {
    lines.push("Reassigning const: " + error.name + " - " + error.message);
  }
  const account = { holder: "Ravi", balance: 5000 };
  account.balance = 7500;       // allowed: object contents can change
  lines.push("const object property modified: balance = " + account.balance);

  // ---- loop scope example ----
  lines.push("");
  lines.push("--- var vs let in a loop ---");
  for (var i = 0; i < 3; i++) { /* var i leaks out of loop */ }
  lines.push("var i after loop = " + i);
  for (let j = 0; j < 3; j++) { /* let j stays inside loop */ }
  lines.push("typeof let j after loop = " + typeof j);

  document.getElementById("scope-output").textContent = lines.join("\n");
}

document.getElementById("scope-btn").addEventListener("click", runScopeDemo);

/* =========================================================
   FINANCIAL FUNCTIONS (reusable)
   ========================================================= */

// EMI = P * r * (1+r)^n / ((1+r)^n - 1), r = monthly rate
function calculateEMI(principal, annualRate, months) {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) {
    return principal / months;       // no-interest case
  }
  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
}

// Simple interest = P * R * T / 100
function calculateSimpleInterest(principal, rate, years) {
  return (principal * rate * years) / 100;
}

// Compound interest amount (compounded yearly) = P * (1 + R/100)^T
function calculateCompoundAmount(principal, rate, years) {
  return principal * Math.pow(1 + rate / 100, years);
}

// Maximum EMI the customer can afford
function maxAffordableEMI(income, existingEmi) {
  return income * MAX_EMI_RATIO - existingEmi;
}

/* =========================================================
   2. LOAN ELIGIBILITY CHECKER
   Operators: relational, logical, arithmetic
   Statements: if, if-else, nested if
   ========================================================= */
document.getElementById("eligibility-form").addEventListener("submit", function (event) {
  event.preventDefault();

  const age      = getNumber("el-age");
  const income   = getNumber("el-income");
  const credit   = getNumber("el-credit");
  const existing = getNumber("el-existing") || 0;
  const loan     = getNumber("el-loan");
  const tenure   = getNumber("el-tenure");

  // Input validation using logical OR
  if (isNaN(age) || isNaN(income) || isNaN(credit) || isNaN(loan) || isNaN(tenure)) {
    showOutput("eligibility-output", "<span class='bad'>Please fill in all fields with valid numbers.</span>");
    return;
  }
  if (age <= 0 || income < 0 || credit < 300 || credit > 900 || loan <= 0 || tenure <= 0) {
    showOutput("eligibility-output", "<span class='bad'>One or more values are out of the allowed range.</span>");
    return;
  }

  let status = "";       // "Approved", "Conditionally Approved", "Rejected"
  let reason = "";
  let rate = BASE_LOAN_RATE;

  // ---- if / else-if / else with logical && and || ----
  if (age < MIN_AGE || age > MAX_AGE) {
    status = "Rejected";
    reason = "Age must be between " + MIN_AGE + " and " + MAX_AGE + " years.";
  } else if (income < MIN_INCOME) {
    status = "Rejected";
    reason = "Minimum monthly income required is " + formatMoney(MIN_INCOME) + ".";
  } else {
    // ---- nested if: decision based on credit score ----
    if (credit >= 750) {
      status = "Approved";
      reason = "Excellent credit score.";
      rate = BASE_LOAN_RATE;
    } else if (credit >= 650) {
      if (income >= 30000 && existing === 0) {
        status = "Conditionally Approved";
        reason = "Fair credit score, approved at a higher interest rate.";
        rate = HIGH_LOAN_RATE;
      } else {
        status = "Rejected";
        reason = "Fair credit score requires income of at least ₹30,000 and no existing EMI.";
      }
    } else {
      status = "Rejected";
      reason = "Credit score is below 650.";
    }
  }

  // ---- EMI affordability check ----
  let html = "";
  let emi = 0;
  if (status !== "Rejected") {
    emi = calculateEMI(loan, rate, tenure);
    const allowed = maxAffordableEMI(income, existing);

    if (emi > allowed) {   // relational operator
      // Try to find the maximum eligible loan with the same rate and tenure
      const monthlyRate = rate / 12 / 100;
      const factor = Math.pow(1 + monthlyRate, tenure);
      const maxLoan = allowed > 0 ? allowed * (factor - 1) / (monthlyRate * factor) : 0;

      status = "Rejected";
      reason = "Required EMI (" + formatMoney(emi) + ") exceeds your affordable EMI (" +
               formatMoney(Math.max(allowed, 0)) + "). Maximum eligible loan is about " +
               formatMoney(Math.max(maxLoan, 0)) + ".";
    }
  }

  // ---- Build result ----
  const cssClass = status === "Approved" ? "ok" : (status === "Rejected" ? "bad" : "warn");
  html += "Status: <span class='" + cssClass + "'>" + status + "</span><br>";
  html += "Reason: " + reason + "<br>";
  if (status !== "Rejected") {
    html += "Interest Rate: " + rate + "% p.a.<br>";
    html += "Monthly EMI: " + formatMoney(emi) + "<br>";
    html += "Total Payable: " + formatMoney(emi * tenure);
  }
  showOutput("eligibility-output", html);
});

/* =========================================================
   3. EMI CALCULATOR (function + for loop for schedule)
   ========================================================= */
document.getElementById("emi-form").addEventListener("submit", function (event) {
  event.preventDefault();

  const principal = getNumber("emi-principal");
  const rate      = getNumber("emi-rate");
  const months    = getNumber("emi-months");
  const showTable = document.getElementById("emi-schedule").checked;

  if (isNaN(principal) || isNaN(rate) || isNaN(months) || principal <= 0 || rate < 0 || months <= 0) {
    showOutput("emi-output", "<span class='bad'>Enter valid positive values for all fields.</span>");
    return;
  }

  const emi = calculateEMI(principal, rate, months);   // function call with return value
  const totalPayable = emi * months;
  const totalInterest = totalPayable - principal;

  let html = "Monthly EMI: <strong>" + formatMoney(emi) + "</strong><br>" +
             "Total Interest: " + formatMoney(totalInterest) + "<br>" +
             "Total Payable: " + formatMoney(totalPayable);

  if (showTable) {
    const monthlyRate = rate / 12 / 100;
    let balance = principal;
    const rows = Math.min(12, months);

    html += "<table><tr><th>Month</th><th>Interest</th><th>Principal</th><th>Balance</th></tr>";

    // ---- for loop: repayment schedule ----
    for (let m = 1; m <= rows; m++) {
      const interestPart = balance * monthlyRate;
      const principalPart = emi - interestPart;
      balance -= principalPart;
      if (balance < 0) { balance = 0; }

      html += "<tr><td>" + m + "</td><td>" + interestPart.toFixed(2) + "</td><td>" +
              principalPart.toFixed(2) + "</td><td>" + balance.toFixed(2) + "</td></tr>";
    }
    html += "</table>";
  }

  showOutput("emi-output", html);
});

/* =========================================================
   4. INTEREST CALCULATOR + SAVINGS GOAL
   Loops: for (interest table), while, do-while
   ========================================================= */
document.getElementById("interest-form").addEventListener("submit", function (event) {
  event.preventDefault();

  const principal = getNumber("int-principal");
  const rate      = getNumber("int-rate");
  const years     = getNumber("int-years");
  const type      = document.getElementById("int-type").value;
  const goal      = getNumber("int-goal");

  if (isNaN(principal) || isNaN(rate) || isNaN(years) || principal <= 0 || rate < 0 || years <= 0) {
    showOutput("interest-output", "<span class='bad'>Enter valid values for principal, rate and years.</span>");
    return;
  }

  let html = "";

  // ---- for loop: year-wise interest table ----
  html += "<table><tr><th>Year</th><th>Opening</th><th>Interest</th><th>Closing</th></tr>";
  let opening = principal;
  for (let year = 1; year <= years; year++) {
    let interest;
    if (type === "simple") {
      interest = principal * rate / 100;          // same each year
    } else {
      interest = opening * rate / 100;            // on growing balance
    }
    const closing = opening + interest;
    html += "<tr><td>" + year + "</td><td>" + opening.toFixed(2) + "</td><td>" +
            interest.toFixed(2) + "</td><td>" + closing.toFixed(2) + "</td></tr>";
    opening = closing;
  }
  html += "</table>";

  // Final amount using the reusable functions (cross-check with the loop)
  let finalAmount;
  let totalInterest;
  if (type === "simple") {
    totalInterest = calculateSimpleInterest(principal, rate, years);
    finalAmount = principal + totalInterest;
  } else {
    finalAmount = calculateCompoundAmount(principal, rate, years);
    totalInterest = finalAmount - principal;
  }
  html = "Total Interest: <strong>" + formatMoney(totalInterest) + "</strong><br>" +
         "Maturity Amount: <strong>" + formatMoney(finalAmount) + "</strong>" + html;

  // ---- while loop: years to double the money (compound) ----
  if (rate > 0) {
    let amount = principal;
    let yearsToDouble = 0;
    while (amount < principal * 2) {
      amount = amount * (1 + rate / 100);
      yearsToDouble++;
    }
    html += "<br>Years to double your money (compound): <strong>" + yearsToDouble + "</strong>";
  }

  // ---- do-while loop: years needed to reach savings goal ----
  if (!isNaN(goal) && goal > 0) {
    if (rate <= 0 && goal > principal) {
      html += "<br><span class='bad'>Goal cannot be reached with 0% interest.</span>";
    } else {
      let balance = principal;
      let yearsToGoal = 0;
      do {
        // do-while runs at least once, even if goal is already met
        if (balance < goal) {
          balance = balance * (1 + rate / 100);
          yearsToGoal++;
        }
      } while (balance < goal && yearsToGoal < 200);

      if (yearsToGoal === 0) {
        html += "<br><span class='ok'>Your principal already meets the goal.</span>";
      } else {
        html += "<br>Years to reach goal of " + formatMoney(goal) + ": <strong>" + yearsToGoal + "</strong>";
      }
    }
  }

  showOutput("interest-output", html);
});

/* =========================================================
   5. ACCOUNT UTILITIES
   switch statement + loop over transactions
   ========================================================= */

// Returns account rules for an account type using switch
function getAccountRules(type) {
  let rules = { name: "", minBalance: 0, interest: 0, monthlyCharge: 0 };

  switch (type) {
    case "savings":
      rules = { name: "Savings Account", minBalance: 5000, interest: 3.5, monthlyCharge: 0 };
      break;
    case "current":
      rules = { name: "Current Account", minBalance: 25000, interest: 0, monthlyCharge: 150 };
      break;
    case "salary":
      rules = { name: "Salary Account", minBalance: 0, interest: 3, monthlyCharge: 0 };
      break;
    case "fd":
      rules = { name: "Fixed Deposit", minBalance: 10000, interest: 6.75, monthlyCharge: 0 };
      break;
    default:
      rules.name = "Unknown Account";
  }
  return rules;
}

document.getElementById("account-form").addEventListener("submit", function (event) {
  event.preventDefault();

  const type    = document.getElementById("acc-type").value;
  const opening = getNumber("acc-balance");
  const txText  = document.getElementById("acc-transactions").value.trim();

  if (isNaN(opening) || opening < 0) {
    showOutput("account-output", "<span class='bad'>Enter a valid opening balance.</span>");
    return;
  }

  const rules = getAccountRules(type);
  const transactions = txText === "" ? [] : txText.split(",");

  let balance = opening;
  let totalDeposits = 0;
  let totalWithdrawals = 0;
  let skipped = 0;

  let html = "<strong>" + rules.name + "</strong><br>" +
             "Minimum Balance: " + formatMoney(rules.minBalance) + " | " +
             "Interest: " + rules.interest + "% p.a. | " +
             "Monthly Charge: " + formatMoney(rules.monthlyCharge) + "<br>" +
             "<table><tr><th>#</th><th>Transaction</th><th>Balance</th></tr>";

  // ---- for loop: process each transaction ----
  for (let i = 0; i < transactions.length; i++) {
    const amount = Number(transactions[i].trim());

    if (isNaN(amount) || amount === 0) {
      skipped++;
      continue;                       // skip invalid entries
    }

    if (amount > 0) {
      totalDeposits += amount;
      balance += amount;
      html += "<tr><td>" + (i + 1) + "</td><td>Deposit +" + amount.toFixed(2) +
              "</td><td>" + balance.toFixed(2) + "</td></tr>";
    } else if (balance + amount < 0) {
      html += "<tr><td>" + (i + 1) + "</td><td>Withdrawal " + amount.toFixed(2) +
              " (declined - insufficient funds)</td><td>" + balance.toFixed(2) + "</td></tr>";
    } else {
      totalWithdrawals += Math.abs(amount);
      balance += amount;
      html += "<tr><td>" + (i + 1) + "</td><td>Withdrawal " + amount.toFixed(2) +
              "</td><td>" + balance.toFixed(2) + "</td></tr>";
    }
  }
  html += "</table>";

  // Monthly interest and charges
  const monthlyInterest = balance * rules.interest / 100 / 12;
  const finalBalance = balance + monthlyInterest - rules.monthlyCharge;

  html += "Total Deposits: " + formatMoney(totalDeposits) + "<br>" +
          "Total Withdrawals: " + formatMoney(totalWithdrawals) + "<br>" +
          "Monthly Interest Credited: " + formatMoney(monthlyInterest) + "<br>" +
          "Closing Balance (after interest and charges): <strong>" + formatMoney(finalBalance) + "</strong><br>";

  if (skipped > 0) {
    html += "<span class='warn'>" + skipped + " invalid transaction(s) were ignored.</span><br>";
  }

  // Minimum balance check (ternary / conditional operator)
  html += finalBalance >= rules.minBalance
    ? "<span class='ok'>Minimum balance maintained.</span>"
    : "<span class='bad'>Below minimum balance - a penalty may apply.</span>";

  showOutput("account-output", html);
});
