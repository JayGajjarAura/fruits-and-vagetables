$(document).ready(function () {

    // ------------Active Inactive Toast--------------

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
        let formData = new FormData($(this).closest('form')[0]);

        // Get the product ID from the parent element's ID attribute
        let productId = $(this).closest('.product-popup').attr('id').split('_')[1];

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
                            url: "/API/product/remove/" + itemId,
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
    
    // $(".show-category").click(function () {
    //     const categoryId = $(this).attr("id").split("-")[2];
    //     $("#category_" + categoryId).show();
    // });

    // $(".close-category").click(function () {
    //     $(this).closest(".category-popup").hide();
    // });



    $(document).on("click", ".category_remove_btn", function (e) {
        e.preventDefault();
        let itemId = $(this).attr("id");

        let categoryId = $(this).data("category-id");

        // Construct the selector for the corresponding span element
        let spanSelector = "#total_product_qty_" + categoryId;

        // Retrieve the value from the span element
        let productQty = $(spanSelector).text().trim();

        if (productQty <= 0) {
            $.confirm({
                icon: "fa fa-warning",
                title: "Are you sure?",
                content: "This Category will be removed from the database... as well as the products from this category",
                type: "red",
                typeAnimated: true,
                buttons: {
                    confirm: {
                        text: "Yes, remove it",
                        btnClass: "btn-red",
                        action: function () {
                            $.ajax({
                                url: "/API/category/remove/" + itemId,
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
        } else {
            // console.log('--------')
            $.confirm({
                icon: "fa fa-warning",
                title: "Are you sure?",
                content: "There are still active products in this category...",
                type: "blue",
                typeAnimated: true,
                buttons: {
                    confirm: {
                        text: "Goto Products",
                        btnClass: "btn-blue",
                        action: function () {
                            location.href = "/admin/product-view";
                        },
                    },
                    cancel: function () {},
                },
            });
        }

        // console.log('iddddddd--------', itemId)
        
    });

    $('.update_Category_btn').click(function(e) {
        e.preventDefault();

        // Get the form data
        let formData = new FormData($(this).closest('form')[0]);

        // Get the category ID from the parent element's ID attribute
        let categoryId = $(this).closest('.category-popup').attr('id').split('_')[1];

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

    //-----------------------------------------------------------------
    $('#activeInactiveBtn').on('click', function () {
        $(".activeInactiveBtn").toast("show");
    });

    $(document).on("change", ".category_toggle", function () {
        const categoryId = $(this).data("category-id");
        const active = $(this).is(":checked");

        $.ajax({
            method: "PUT",
            url: `/API/categories/${categoryId}`,
            data: { active: active },
            success: function (response) {
                if (active) {
                    $(`#product-list-${categoryId}`).show();
                } else {
                    $(`#product-list-${categoryId}`).hide();
                }
            },
            error: function (error) {
                console.error("Error updating category status", error);
            },
        });
    });


});

function adminLogin() {
    let email = document.getElementById("admin_Input_Email").value;
    let password = document.getElementById("admin_Input_Password").value;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/admin/adminLogin", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                // Successful response, redirect to the homepage
                window.location.href = "/admin/dashboard";
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

//--------------- Image Preveiw on Upload ----------------------

function previewImage(event) {
    let input = event.target;
    if (input.files?.[0]) {
        let reader = new FileReader();

        reader.onload = function (e) {
            let imagePreview = document.getElementById("preview");
            imagePreview.src = e.target.result;
            imagePreview.style.display = "block";
            document.getElementById("removeImage").style.display = "block";
        };

        reader.readAsDataURL(input.files[0]);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("removeImage").addEventListener("click", function () {
        document.getElementById("productFile").value = "";
        document.getElementById("preview").src = "#";
        document.getElementById("preview").style.display = "none";
        this.style.display = "none";
    });

    document.getElementById("removeImage").addEventListener("click", function () {
        document.getElementById("categoryFile").value = "";
        document.getElementById("preview").src = "#";
        document.getElementById("preview").style.display = "none";
        this.style.display = "none";
    });
});

function previewImageProduct(event, productId) {
    let input = event.target;
    if (input.files?.[0]) {
        let reader = new FileReader();

        reader.onload = function (e) {
            let imagePreview = document.getElementById("preview_" + productId);
            imagePreview.src = e.target.result;
            imagePreview.style.display = "block";
            document.getElementById("removeImage_" + productId).style.display = "block";
        };

        reader.readAsDataURL(input.files[0]);
    }
}
