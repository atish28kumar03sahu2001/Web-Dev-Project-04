document.addEventListener("DOMContentLoaded", () => {
  // Get references to HTML elements
  const ExpenseForm = document.getElementById("EXPENSEFORM");
  const ExpenseList = document.getElementById("EXPENSE_LIST");
  const submitButton = ExpenseForm.querySelector(".SBMT");
  const sortAscButton = document.querySelector("#ASCBTN");
  const sortDescButton = document.querySelector("#DESBTN");
  let editIndex = null;
  let amount = 0;
  // Function to calculate total expense
  function ToTalExpense(expenses = null) {
    let amounts = document.getElementById("TOTAL");
    amount = 0;
    let expense = expenses || JSON.parse(localStorage.getItem("ExpenseArray")) || [];
    expense.forEach(expense => {
      amount += parseInt(expense.ExpensePrice) || 0;
    });
    amounts.innerHTML = `&nbsp;${amount}₹ `;
  }
  // Event listener for form submission
  ExpenseForm.addEventListener("submit", (event) => {
    event.preventDefault();
    // Validate form fields
    const fields = [
      { value: document.getElementById("EXPID").value.trim(), message: "Expense ID is required." },
      { value: document.getElementById("EXPNAME").value.trim(), message: "Expense Name is required." },
      { value: document.getElementById("EXPDTL").value.trim(), message: "Expense Details are required." },
      { value: document.getElementById("EXPPRICE").value.trim(), message: "Expense Price is required." },
      { value: document.getElementById("EXPDATE").value.trim(), message: "Expense Date is required." },
      { value: document.getElementById("EXPCATEGORY").value.trim(), message: "Expense Category is required." },
    ];
    for (const field of fields) {
      if (!field.value) {
        showToast(field.message);
        return;
      }
    }
    // Create expense object
    const ExpenseObj = {
      ExpenseId: fields[0].value,
      ExpenseName: fields[1].value,
      ExpenseDetail: fields[2].value,
      ExpensePrice: parseFloat(fields[3].value),
      ExpenseDate: fields[4].value,
      ExpenseOption: fields[5].value,
    };
    // Retrieve stored expenses
    let ExpenseArray = JSON.parse(localStorage.getItem("ExpenseArray")) || [];
    // If editing, update the existing record, else add new expense
    if (editIndex !== null) {
      ExpenseArray[editIndex] = ExpenseObj;
      showToast("Expense Updated Successfully!", "success");
      submitButton.value = "Add Expense";
      editIndex = null;
    } else {
      ExpenseArray.push(ExpenseObj);
      showToast("Expense Added Successfully!", "success");
    }
    // Save updated expenses to local storage
    localStorage.setItem("ExpenseArray", JSON.stringify(ExpenseArray));
    ExpenseForm.reset();
    DisplayExpenseSummary();
    ToTalExpense();
  });
  // Function to display expense summary
  function DisplayExpenseSummary(expenses = null) {
    const expenseArray = expenses || JSON.parse(localStorage.getItem("ExpenseArray")) || [];
    ExpenseList.innerHTML = "";
    expenseArray.forEach((expense, index) => {
      const expenseItem = document.createElement("details");
      expenseItem.classList.add("DATA_DETAILS");
      // Populate expense details
      expenseItem.innerHTML = `
        <summary class="DATA_DETAILS_SUMMARY">${expense.ExpenseId}</summary>
        <p class="EXPPHD">Expense Name: <span class="SPANP">${expense.ExpenseName}</span></p>
        <p class="EXPPHD">Expense Price: <span class="SPANP">${expense.ExpensePrice}</span> /-</p>
        <p class="EXPPHD">Expense Date: <span class="SPANP">${expense.ExpenseDate}</span></p>
        <p class="EXPPHD">Expense Category: <span class="SPANP">${expense.ExpenseOption}</span></p>
        <p class="EXPP">${expense.ExpenseDetail}</p>
        <button class="OPERBTN" data-index="${index}" data-action="edit">
          <i class="fa-solid fa-pencil fa-xl" style="color: #ffffff;"></i>
        </button>
        <button class="OPERBTN" data-index="${index}" data-action="delete">
          <i class="fa-solid fa-trash-can fa-xl" style="color: #ffffff;"></i>
        </button>
      `;
      ExpenseList.appendChild(expenseItem);
    });
    // Add event listeners to edit and delete buttons
    document.querySelectorAll(".OPERBTN").forEach((button) => {
      button.addEventListener("click", function () {
        const index = this.getAttribute("data-index");
        const action = this.getAttribute("data-action");
        if (action === "delete") deleteExpense(index);
        if (action === "edit") editExpense(index);
      });
    });
  }
  // Function to delete an expense
  function deleteExpense(index) {
    let expenses = JSON.parse(localStorage.getItem("ExpenseArray")) || [];
    expenses.splice(index, 1);
    localStorage.setItem("ExpenseArray", JSON.stringify(expenses));
    showToast("Expense Deleted Successfully!", "success");
    DisplayExpenseSummary();
  }
  // Function to edit an expense
  function editExpense(index) {
    let expenses = JSON.parse(localStorage.getItem("ExpenseArray")) || [];
    const expense = expenses[index];
    // Populate form with selected expense details
    document.getElementById("EXPID").value = expense.ExpenseId;
    document.getElementById("EXPNAME").value = expense.ExpenseName;
    document.getElementById("EXPDTL").value = expense.ExpenseDetail;
    document.getElementById("EXPPRICE").value = expense.ExpensePrice;
    document.getElementById("EXPDATE").value = expense.ExpenseDate;
    document.getElementById("EXPCATEGORY").value = expense.ExpenseOption;
    submitButton.value = "Edit Expense";
    editIndex = index;
  }
  // Sorting expenses
  function sortExpenses(order) {
    let expenses = JSON.parse(localStorage.getItem("ExpenseArray")) || [];
    let sortedExpenses = expenses.toSorted((a, b) => {
      return order === "asc" ? a.ExpensePrice - b.ExpensePrice : b.ExpensePrice - a.ExpensePrice;
    });
    DisplayExpenseSummary(sortedExpenses);
  }
  sortAscButton.addEventListener("click", () => sortExpenses("asc"));
  sortDescButton.addEventListener("click", () => sortExpenses("desc"));
  // Search and filter expenses
  const searchInput = document.getElementById("SEARCH");
  let debounceTimer;
  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      filterExpenses(searchInput.value.trim().toLowerCase());
    }, 300);
  });
  function filterExpenses(query) {
    let expenses = JSON.parse(localStorage.getItem("ExpenseArray")) || [];
    if (query) {
      expenses = expenses.filter(expense =>
        expense.ExpenseId.toLowerCase().includes(query) ||
        expense.ExpenseName.toLowerCase().includes(query) ||
        expense.ExpenseDetail.toLowerCase().includes(query) ||
        expense.ExpenseOption.toLowerCase().includes(query) ||
        expense.ExpensePrice.toString().includes(query) ||
        expense.ExpenseDate.includes(query)
      );
    }
    DisplayExpenseSummary(expenses);
    ToTalExpense(expenses);
  }
  DisplayExpenseSummary();
  ToTalExpense();
});
// Toastify Notification Code
function showToast(message, type = "error") {
  Toastify({
    text: message,
    duration: 3000,
    close: true,
    gravity: "top",
    position: "right",
    style: {
      backgroundColor: type === "success" ? "rgb(0, 73, 102)" : "rgb(121, 217, 255)",
      color: type === "success" ? "white" : "rgb(0, 73, 102)",
      borderRadius: "8px",
      padding: "10px",
      fontFamily: "Arial, sans-serif",
      fontSize: "14px",
    },
  }).showToast();
}