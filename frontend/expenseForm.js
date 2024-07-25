const server = "http://13.201.186.221";

//Dom Loading expenses
let currentPage = 1;
let lastPage = false;

document.addEventListener("DOMContentLoaded", async () => {
  let pageSize = localStorage.getItem("pageSize");
  if (pageSize === null) {
    pageSize = 5;
    localStorage.setItem("pageSize", pageSize);
  }
  document.getElementById("rowSizeSelect").value = pageSize;

  let data = await getExpensesForPage(currentPage, pageSize);
  if (data && data.expenses) {
    data.expenses.forEach((expense) => {
      addExpenseToUI(expense);
    });
  }
  const prevBtn = document.getElementById("prevPage");
  const nextBtn = document.getElementById("nextPage");
  const currentPageEl = document.getElementById("currentPage");
  currentPageEl.textContent = currentPage;
  if (currentPage == 1) prevBtn.disabled = true;
  else prevBtn.disabled = false;
  if (data.lastPage) nextBtn.disabled = true;
  else nextBtn.disabled = false;
  lastPage = data.lastPage;

  premiumUser(data.user.isPremium);
});

document.getElementById("btns").addEventListener("click", async (e) => {
  let data;

  if (e.target.classList.contains("prev")) {
    if (currentPage > 1) {
      data = await getExpensesForPage(
        --currentPage,
        localStorage.getItem("pageSize")
      );
    }
  } else if (e.target.classList.contains("next")) {
    data = await getExpensesForPage(
      ++currentPage,
      localStorage.getItem("pageSize")
    );
  }
  if (data && data.expenses) {
    const expenseListNode = document.getElementById("expense-list");
    while (expenseListNode.childNodes.length > 0)
      expenseListNode.removeChild(expenseListNode.lastChild);
    data.expenses.forEach((expense) => {
      addExpenseToUI(expense);
    });
  }
  //btns prev and next
  const prevBtn = document.getElementById("prevPage");
  const nextBtn = document.getElementById("nextPage");
  if (currentPage == 1) prevBtn.disabled = true;
  else prevBtn.disabled = false;
  if (data?.lastPage) nextBtn.disabled = true;
  else nextBtn.disabled = false;
  lastPage = data?.lastPage;
  const currentPageEl = document.getElementById("currentPage");
  currentPageEl.textContent = currentPage;
});

document.getElementById("rowSizeSelect").addEventListener("change", (e) => {
  e.preventDefault();
  localStorage.setItem("pageSize", e.target.value);
  window.location.reload();
});

//adding an expense
document.getElementById("expenseForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const amount = document.getElementById("expenseAmount").value;
  const description = document.getElementById("expenseDesc").value;
  const category = document.getElementById("expenseCat").value;
  let response = await postExpense({ amount, description, category });
  if (response) {
    addExpenseToUI(response.expense, "recent");
    if (lastPage) addExpenseToUI(response.expense);
  }
});

//deleting an expense
document.getElementById("expense-list").addEventListener("click", async (e) => {
  e.preventDefault();
  expense_id = e.target.getAttribute("expense_id");
  let response;
  if (expense_id) {
    response = await deleteExpense(expense_id);
  }
  if (response) {
    //delete from UI
    removeFromUI(e.target);
  }
});

document
  .getElementById("buy-premium-btn")
  .addEventListener("click", async (e) => {
    let newOrder = await fetch(`${server}/purchase/buymembership`, {
      headers: {
        "Content-Type": "application/json",
        token: localStorage.getItem("token"),
      },
    });
    newOrder = await newOrder.json();
    let options = {
      key: newOrder.key_id,
      order_id: newOrder.rzpOrder.id,
      handler: function (response) {
        fetch(`${server}/purchase/verifyPayment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify({
            orderId: newOrder.orderId,
            rzpOrderId: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            alert(data.message);
            localStorage.setItem("token", data.token);
            premiumUser(data.user.isPremium);
          });
      },
    };
    let rzp_c = new Razorpay(options);
    rzp_c.open();
    rzp_c.on("payment.failed", (response) => {
      alert("Something went wrong");
    });
  });

document
  .getElementById("show-leaderboard-btn")
  ?.addEventListener("click", async () => {
    const leaderboardList = document.getElementById("leaderboard-list");
    while (leaderboardList.firstChild) {
      leaderboardList.removeChild(leaderboardList.firstChild);
    }
    const heading = document.createElement("li");
    heading.innerHTML = "<h3>Most Expenses</h3>";
    heading.style.marginBottom = "5px";
    leaderboardList.append(heading);
    // leaderboardList.append(document.createElement("hr"));
    let data = await getLeaderboard();
    data.usersWithExpenses.forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = `<b>${item.username}</b> have total <b>${item.totalExpense}</b> Expenses`;
      li.style.fontSize = "14px";
      leaderboardList.append(li);
    });
  });

document
  .getElementById("dayToDayExpenseBtn")
  ?.addEventListener("click", (e) => {
    document.location = "./dayToDayExpense.html";
  });

document
  .getElementById("downloadReport")
  .addEventListener("click", async (e) => {
    e.preventDefault();
    let response = await fetch(`${server}/files/download/report`, {
      headers: {
        "Content-Type": "application/json",
        token: localStorage.getItem("token"),
      },
    });
    const data = await response.json();
    const url = data.url;

    const downloadResponse = await fetch(url);
    const blob = await downloadResponse.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    let filename = data.url
      .split("amazonaws.com/")[1]
      .split("?AWSAccessKeyId")[0];
    link.download = filename;

    link.click();
  });

function addExpenseToUI(expense, recent) {
  let toAdd = recent ? `recent-expense-list` : `expense-list`;

  const expenseListNode = document.getElementById(toAdd);
  if (recent && expenseListNode.childNodes.length >= 3) {
    expenseListNode.removeChild(expenseListNode.firstChild);
  }
  if (
    !recent &&
    expenseListNode.childNodes.length >= localStorage.getItem("pageSize")
  ) {
    const nextBtn = document.getElementById("nextPage");
    nextBtn.disabled = false;
    nextBtn.click();
    return;
  }
  if (recent) {
    document.getElementById("recentlyAddedHeading").style.display = "block";
  }

  let amountTextNode = document.createTextNode(expense.amount);
  let descriptionTextNode = document.createTextNode(expense.description);
  let categoryTextNode = document.createTextNode(expense.category);
  let liNode = document.createElement("li");
  liNode.classList.add("expense-item");
  let buttonText = document.createTextNode("Delete");
  let buttonNode = document.createElement("button");
  buttonNode.classList.add("btn", "delete-btn");
  buttonNode.setAttribute("expense_id", expense.id);
  buttonNode.appendChild(buttonText);
  liNode.appendChild(amountTextNode);
  liNode.appendChild(document.createTextNode(" || "));
  liNode.appendChild(descriptionTextNode);
  liNode.appendChild(document.createTextNode(" || "));
  liNode.appendChild(categoryTextNode);
  liNode.appendChild(document.createTextNode(" "));
  if (!recent) liNode.appendChild(buttonNode);

  expenseListNode.appendChild(liNode);
}

function removeFromUI(targetElement) {
  let parent = targetElement.parentNode.parentNode;
  parent.removeChild(targetElement.parentNode);
  if (parent.childNodes.length == 0) {
    if (currentPage == 1) {
      window.location.reload();
      return;
    }
    document.getElementById("prevPage").click();
  }
}

async function postExpense(expense) {
  try {
    let response = await fetch(`${server}/expense/add_expense`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: localStorage.getItem("token"),
      },
      body: JSON.stringify({
        amount: expense.amount,
        description: expense.description,
        category: expense.category,
      }),
    });
    response = await response.json();
    return response;
  } catch (e) {
    console.log(e);
  }
}

async function getAllExpenses() {
  try {
    let response = await fetch(`${server}/expense/get_expenses`, {
      headers: {
        token: localStorage.getItem("token"),
      },
    });
    response = await response.json();
    return response;
  } catch (e) {
    console.log(e);
  }
}

async function getExpensesForPage(page, pageSize) {
  try {
    let response = await fetch(
      `${server}/expense/get_expenses/?page=${page}&size=${pageSize}`,
      {
        headers: {
          token: localStorage.getItem("token"),
        },
      }
    );
    response = await response.json();
    return response;
  } catch (e) {
    console.log(e);
  }
}

async function deleteExpense(id) {
  try {
    let response = await fetch(`${server}/expense/delete_expense/${id}`, {
      headers: {
        token: localStorage.getItem("token"),
      },
    });
    response = await response.json();
    return response;
  } catch (e) {
    console.log(e);
  }
}

function premiumUser(isPremium) {
  const premiumBtn = document.getElementById("buy-premium-btn");
  const premiumStatus = document.getElementById("premium");

  if (isPremium) {
    premiumBtn.style.display = "none";
    premiumStatus.style.display = "flex";
  } else {
    premiumBtn.style.display = "flex";
    premiumStatus.style.display = "none";
  }
}

async function getLeaderboard() {
  let data = await fetch(`${server}/expense_features/leaderboard`, {
    headers: {
      token: localStorage.getItem("token"),
    },
  });
  data = await data.json();
  return data;
}
