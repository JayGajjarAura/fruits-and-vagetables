function adminLogin() {
    let email = document.getElementById("admin_Input_Email").value;
    let password = document.getElementById("admin_Input_Password").value;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/adminLogin", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                // Successful response, redirect to the homepage
                window.location.href = "/dashboard";
            } else if (xhr.status === 401) {
                // Unauthorized, display the error message
                let response = JSON.parse(xhr.responseText);
                let errorSpan = document.getElementById("errorSpan");
                errorSpan.innerText = response.error;
            } else {
                // Other error occurred, display a generic error message
                let errorSpan = document.getElementById("errorSpan");
                errorSpan.innerText = "An error occurred. Please try again later.";
            }
        }
    };

    let data = JSON.stringify({ email: email, password: password });
    xhr.send(data);
}
