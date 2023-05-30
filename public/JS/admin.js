$(document).ready(function () {
    $("#categoryAdd").submit(function (e) {
        e.preventDefault(); // Prevent the default form submission

        // Create a FormData object to store the form data
        let formData = new FormData(this);

        // Send the AJAX request
        $.ajax({
            url: "/API/category",
            type: "POST",
            data: formData,
            contentType: false,
            processData: false,
            success: function (response) {
                console.log(response);
                console.log('Category Added Success');
                $(".success-message").show();
                setTimeout(function () {
                    $(".success-message").fadeOut();
                }, 1500);
            },
            error: function (error) {
                console.log(error);
            },
        });
    });

    $("#productAdd").submit(function (e) {
        e.preventDefault(); // Prevent the default form submission

        // Create a FormData object to store the form data
        let formData = new FormData(this);

        let selectedCategory = $("#productCategory").val();
        formData.append("category", selectedCategory);

        // Send the AJAX request
        $.ajax({
            url: "/API/products",
            type: "POST",
            data: formData,
            contentType: false,
            processData: false,
            success: function (response) {
                // console.log(response);
                // console.log('Category Added Success');
                $(".success-message").show();
                setTimeout(function () {
                    $(".success-message").fadeOut();
                }, 1500);
            },
            error: function (error) {
                console.log(error);
            },
        });
    });

    //----------------------- PRODUCT ---------------------

    $(".show-product").click(function () {
        // Get the form element
        let $form = $("#product_" + $(this).attr("id").split("-")[2]);
        $form.show();
    });


    $('.close-product').click(function() {
        $(".product-popup").hide();
    })

    // Add an event listener to the update button
    $('.update_Product_btn').click(function(e) {
        e.preventDefault();

        // Get the form data
        var formData = new FormData($(this).closest('form')[0]);

        // Get the product ID from the parent element's ID attribute
        var productId = $(this).closest('.product-popup').attr('id').split('_')[1];

        // Send the AJAX request
        $.ajax({
            url: '/API/products/' + productId,
            type: 'PATCH',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                // Handle the successful response
                console.log(response);
                $(".success-message").show();
                setTimeout(function () {
                    location.reload();
                }, 1500);
            },
            error: function(xhr, status, error) {
                // Handle the error
                console.log(xhr.responseText);
            }
        });
    });

    $(document).on("click", ".product_remove_btn", function (e) {
        e.preventDefault();
        let itemId = $(this).attr("id");

        console.log('iddddddd--------', itemId)
        $.confirm({
            icon: "fa fa-warning",
            title: "Are you sure?",
            content: "This item will be removed from Database...",
            type: "red",
            typeAnimated: true,
            buttons: {
                confirm: {
                    text: "Yes, remove it",
                    btnClass: "btn-red",
                    action: function () {
                        $.ajax({
                            url: "/product/remove/" + itemId,
                            type: "POST",
                            success: function () {
                                location.reload()
                            },
                            error: function (err) {
                                console.log(err);
                            },
                        });
                    },
                },
                cancel: function () {},
            },
        });
    });

    //--------------------- Category ----------------------
    
    $(".show-category").click(function () {
        // Get the form element
        let $form = $("#category_" + $(this).attr("id").split("-")[2]);
        $form.show();
    });

    $('.close-category').click(function() {
        $(".category-popup").hide();
    })


    $(document).on("click", ".category_remove_btn", function (e) {
        e.preventDefault();
        let itemId = $(this).attr("id");

        console.log('iddddddd--------', itemId)
        $.confirm({
            icon: "fa fa-warning",
            title: "Are you sure?",
            content: "This Category will be removed from the database...",
            type: "red",
            typeAnimated: true,
            buttons: {
                confirm: {
                    text: "Yes, remove it",
                    btnClass: "btn-red",
                    action: function () {
                        $.ajax({
                            url: "/category/remove/" + itemId,
                            type: "POST",
                            success: function () {
                                location.reload()
                            },
                            error: function (err) {
                                console.log(err);
                            },
                        });
                    },
                },
                cancel: function () {},
            },
        });
    });

    $('.update_Category_btn').click(function(e) {
        e.preventDefault();

        // Get the form data
        var formData = new FormData($(this).closest('form')[0]);

        // Get the category ID from the parent element's ID attribute
        var categoryId = $(this).closest('.category-popup').attr('id').split('_')[1];

        // Send the AJAX request
        $.ajax({
            url: '/API/category/' + categoryId,
            type: 'PATCH',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                // Handle the successful response
                console.log(response);
                $(".success-message").show();
                setTimeout(function () {
                    location.reload();
                }, 1500);
            },
            error: function(xhr, status, error) {
                // Handle the error
                console.log(xhr.responseText);
            }
        });
    });

});

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
