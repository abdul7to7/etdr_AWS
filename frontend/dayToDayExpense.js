const server = "http://13.201.186.221:3000";

document.addEventListener("DOMContentLoaded", async (e) => {
  document.getElementById("currentYear").textContent = new Date().getFullYear();
  const table = document.getElementById("mainTable");
  let td;
  let data = await getExpensesByPage();
  let total = 0;
  let monthlyExpense = new Array(12).fill(0);
  let currentDate = new Date();
  data.expenses.forEach((expense) => {
    addExpenseToUI(expense);
    total += expense.amount;
    let createdDate = new Date(expense.createdAt);
    if (createdDate.getFullYear() == currentDate.getFullYear()) {
      monthlyExpense[createdDate.getMonth()] += expense.amount;
    }
  });
  addTomonthlyTableUI(monthlyExpense);
  const newRow = table.insertRow(-1);
  const newCell = newRow.insertCell(0);
  newCell.textContent = `Total Expenses = ${total}`;
  newCell.colSpan = table.rows[0].cells.length;
  newCell.classList.add("numbers");
  newRow.style.backgroundColor = "lightblue";
});

async function getExpensesByPage() {
  let data = await fetch(`${server}/expense/get_expenses?page=1&size=10`, {
    headers: {
      token: localStorage.getItem("token"),
    },
  });
  data = await data.json();
  return data;
}

function addExpenseToUI(expense) {
  let tr = document.createElement("tr");
  let tdAmount = document.createElement("td");
  let tdDescription = document.createElement("td");
  let tdCategory = document.createElement("td");
  let tdDate = document.createElement("td");
  tdAmount.textContent = expense.amount;
  tdDescription.textContent = expense.description;
  tdCategory.textContent = expense.category;
  tdDate.textContent = expense.createdAt.substring(0, 10);
  tdDescription.classList.add("names");
  tdCategory.classList.add("names");
  //   tdDate.classList.add("names");
  tdAmount.classList.add("numbers");
  tr.appendChild(tdDate);
  tr.appendChild(tdDescription);
  tr.appendChild(tdCategory);
  tr.appendChild(tdAmount);
  const table = document.getElementById("mainTable");
  table.appendChild(tr);
}

function addTomonthlyTableUI(monthlyExpense) {
  let table = document.getElementById("monthlyExpenseTable");

  monthlyExpense.forEach((amount, month) => {
    if (amount != 0) {
      let tr = document.createElement("tr");
      let td1 = document.createElement("td");
      let td2 = document.createElement("td");
      let td3 = document.createElement("td");
      let td4 = document.createElement("td");
      if (month == 0) {
        td1.textContent = "January";
      } else if (month == 1) {
        td1.textContent = "February";
      } else if (month == 2) {
        td1.textContent = "March";
      } else if (month == 3) {
        td1.textContent = "April";
      } else if (month == 4) {
        td1.textContent = "May";
      } else if (month == 5) {
        td1.textContent = "June";
      } else if (month == 6) {
        td1.textContent = "July";
      } else if (month == 7) {
        td1.textContent = "August";
      } else if (month == 8) {
        td1.textContent = "September";
      } else if (month == 9) {
        td1.textContent = "October";
      } else if (month == 10) {
        td1.textContent = "November";
      } else if (month == 11) {
        td1.textContent = "December";
      }
      td2.textContent = 60000;
      td3.textContent = amount;
      td4.textContent = 60000 - amount;

      td2.classList.add("numbers");
      td3.classList.add("numbers");
      td4.classList.add("numbers");

      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(td3);
      tr.appendChild(td4);
      table.appendChild(tr);
    }
  });
}
