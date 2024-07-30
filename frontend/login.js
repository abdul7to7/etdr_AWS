const server = "http://13.201.186.221";

document.getElementById("loginForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const mail = document.getElementById("loginMail").value;
  const password = document.getElementById("loginPassword").value;

  axios
    .post(`${server}/user/login`, {
      mail: mail,
      password: password,
    })
    // .then((response) => {
    //   return response.json();
    // })
    .then((response) => {
      if (response.data.success == false) {
        // window.location.href = "./login.html";
        // add msg to ui here
        return;
      }
      localStorage.setItem("token", response.data.token);
      window.location.href = "./expenseForm.html";
    })
    .catch((e) => {
      alert(e);
    });
});

document.getElementById("forgot-password").addEventListener("click", () => {
  document.getElementById("forgot-password-form").style.display = "block";
});

document
  .getElementById("forgot-password-form")
  ?.addEventListener("submit", (e) => {
    e.preventDefault();
    const mail = document.getElementById("forgot-password-mail").value;
    fetch(`${server}/user/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mail: mail,
      }),
    })
      .then(() => {
        alert("Password reset link sent to email");
      })
      .catch((e) => {
        alert(e);
      });
  });
