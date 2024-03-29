$(document).ready(function (e) {

    //............ Subscribe toast ...............
    $('#myBtn').on('click', function () {
        $('.toast_sub').toast('show')
    });

    //............. ADD TO CART TOAST...........
    $(".add_to_cart_toast").on('click' ,function () {
        let cart_toast_info = $(this).parent().find("input").val();
        // console.log(cart_toast_info)

        document.getElementById("add_to_cart_toast").innerHTML =  cart_toast_info + " items added to your cart...";

        if (cart_toast_info < 1) {
            alert("Cannot add ZERO quantity in cart ");
        } else {
            $(".cart_toast").toast("show");

        }
    });

    function total_cart_value() {
        let total = 0
        $('.input_val').each(function() {
            total += +this.value
        })
        return total
    }
        // $('.add_to_cart_btn').click(function() {
        //     console.log(total_cart_value())
        // })

    $('.add_to_cart_btn').on('click',function() {
        document.getElementById('total_cart_value').innerHTML = total_cart_value() 
    })

    //.......... Add to cart plus btn ............
    $(".plus_btn").on('click',function() {
        let currnet_val = parseInt($(this).parent().find('input').val());
        if(currnet_val == 10) {
            $(this).css('id', 'disable')
            alert('max')
        } else {
            $(this).parent().find('input').val(currnet_val + 1);
        }
    })

    $(".minus_btn").on('click',function () {
        let currnet_val = parseInt($(this).parent().find('input').val());
        if(currnet_val == 0) {
            $(this).css('id', 'disable')
            alert('min')
        } else {
            $(this).parent().find('input').val(currnet_val - 1);
        }
    })

    $(".dropdown-toggle").on ('click',function () {
        $(".dropdown-menu").toggle();
    });

    //______________________ Show login and signup __________________________

    $(".show-login").on('click',function () {
        $("#loginPopup").show();
    });
    
    $(".showLogin").on('click',function () {
        $("#showLogin").show();
        $("#showRegister").hide();
    });

    $(".showRegister").on('click',function () {
        $("#showRegister").show();
        $("#showLogin").hide();
    });

    $(".close").on('click',function () {
        $("#loginPopup").hide();
    });

    //--------------- Address ------------------

    $(".show-address").on('click',function () {
        // Get the form element
        let $form = $("#address_" + $(this).attr("id").split("-")[2]);
        $form.show();
    });


    $('.close-address').on('click',function() {
        $(".address-popup").hide();
    })

    //--------------- Change Email and Password -----------------

    $("#showChangeEmail").hide();

    $(".showChangeEmail").on('click',function () {
        $("#showChangeEmail").show();
        $("#showChangePassword").hide();
    });

    $(".showChangePassword").on('click',function () {
        $("#showChangePassword").show();
        $("#showChangeEmail").hide();
    });

    $(document).on("click", ".remove_btn", function (e) {
        e.preventDefault();
        let itemId = $(this).attr("id");
        $.confirm({
            icon: "fa fa-warning",
            title: "Are you sure?",
            content: "This item will be removed from cart...",
            type: "red",
            typeAnimated: true,
            buttons: {
                confirm: {
                    text: "Yes, remove it",
                    btnClass: "btn-red",
                    action: function () {
                        $.ajax({
                            url: "/cart/remove/" + itemId,
                            type: "POST",
                            success: function (result) {
                                location.reload(result)
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

    $(document).on("click", ".clear_cart_btn", function (e) {
        e.preventDefault();
        let itemId = $(this).attr("id");
        $.confirm({
            icon: "fa fa-warning",
            title: "Are you sure?",
            content: "This will remove all the items from cart...",
            type: "red",
            typeAnimated: true,
            buttons: {
                confirm: {
                    text: "Yes, Clear Cart",
                    btnClass: "btn-red",
                    action: function () {
                        $.ajax({
                            url: "/cart/clear/" + itemId,
                            type: "POST",
                            success: function (result) {
                                location.reload()
                                // console.log('resultttttttttttttttt'+result)
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

    $(document).on("click", ".wishlist_remove_btn", function (e) {
        e.preventDefault();
        let itemId = $(this).attr("id");
        $.confirm({
            icon: "fa fa-warning",
            title: "Are you sure?",
            content: "This item will be removed from Wishlist...",
            type: "red",
            typeAnimated: true,
            buttons: {
                confirm: {
                    text: "Yes, remove it",
                    btnClass: "btn-red",
                    action: function () {
                        $.ajax({
                            url: "/wishlist/remove/" + itemId,
                            type: "POST",
                            success: function (result) {
                                location.reload()
                                // console.log('resultttttttttttttttt'+result)
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

    $(function autocomplete() {
        let debounceTimer;
        $("#browser-input").autocomplete({
            source: function (request, response) {

                const term = $.trim(request.term);

                // Check if the term is empty or contains only whitespace
                if (term === "") {
                    response([]); // Return an empty array if there is no valid search term
                    return;
                }
                // Clear the previous debounce timer
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(function () {
                    $.ajax({
                        url: "/autocomplete",
                        dataType: "json",
                        data: {
                            term: term,
                        },
                        success: function (data) {
                            // Create an array of objects, each with 'label' and 'value' properties
                            let results = $.map(data, function (item) {
                                return {
                                    label: item.title,
                                    value: item.slug, // Add the product slug as the 'value' property
                                };
                            });
                            // response(filteredResults);
                            response(results);
                        },
                    });
                }, 300); // Set the debounce time to 500ms
            },
            minLength: 2,
            select: function (event, ui) {
                // Redirect to the product search results page for the selected product
                window.location.href = "/products/" + ui.item.value;
            },
        });
    });

    //---------------- Update Address -----------------

    $(document).on("click", ".update_address_btn", function (e) {
        e.preventDefault(); // Prevent the default form submission

        // Get the form element
        let $form = $(this).closest("form")

        // Get the form data
        let formData = {
            firstName: $form.find("#validationCustom01").val(),
            lastName: $form.find("#validationCustom02").val(),
            contactNumber: $form.find("#validationCustom08").val(),
            houseNo: $form.find("#validationCustom06").val(),
            area: $form.find("#validationCustom07").val(),
            city: $form.find("#validationCustom03").val(),
            state: $form.find("#validationCustom04").val(),
            pincode: $form.find("#validationCustom05").val(),
        };

        // Get the address ID
        let addressId = $(this).data("address-id");

        // console.log("address---- id-------- JS", addressId);

        // Send the AJAX request
        $.ajax({
            type: "PATCH",
            url: "/address/update/" + addressId,
            data: formData,
            success: function (response) {
                // Handle the success response
                // console.log("Address updated successfully:", response);
                $(".success-message").show();
                setTimeout(function () {
                    location.reload();
                }, 1500);
            },
            error: function (error) {
                console.log("Error updating address:", error);
            },
        });
    });

    

})


//------- Validation for password-------

let validateForm = function () {
    return checkName();
}

function checkName() {
    let x = document.myForm;
    let input = x.Input_Password.value;
    let errMsgHolder = document.getElementById('nameErrMsg');
    if (input.length < 8) {
        errMsgHolder.innerHTML =
            'minimum password length 8';
        return false;
    } else if (!(/^\S{3,}$/.test(input))) {
        errMsgHolder.innerHTML =
            'password cannot contain whitespace';
        return false;
    } else {
        errMsgHolder.innerHTML = '';
        return undefined;
    }
}

//------- Change Password-------------

let validatePassword = function () {
    return checkPassword();
};

function checkPassword() {
    let x = document.mypass;
    let input = x.new_Input_Password.value;
    let errMsgHolder = document.getElementById('passErrMsg');
    if (input.length < 8) {
        errMsgHolder.textContent = 'Minimum password length is 8 characters.';
        return false;
    } else if (/\s/.test(input)) {
        errMsgHolder.textContent = 'Password cannot contain whitespace.';
        return false;
    } else {
        errMsgHolder.textContent = '';
        return true;
    }
}


//--------- Navbar code -----------
function openNav() {
    document.getElementById("mySidenav").style.width = "300px";
    document.getElementById("main").style.marginLeft = "300px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
}

async function calculateCartTotals() {
    // Check if the #cart-body element exists on the current page
    let cartBody = document.querySelector("#cart-body");
    if (!cartBody) {
        return; // Exit the function if the #cart-body element does not exist
    }

    //________________________ Grand Total_________________________
    let subTotalCells = cartBody.querySelectorAll("td#subTotal");
    let grandTotal = 0;

    for (let subTotal of subTotalCells) {
        grandTotal += parseInt(subTotal.textContent)
    }

    document.getElementById("grandTotal").textContent = grandTotal.toFixed(2);

    // ____________________________total Qty_________________________
    let subQuantityCell = cartBody.querySelectorAll("input[type='text']");
    let totalQuantity = 0;

    for (let input of subQuantityCell) {
        totalQuantity += parseInt(input.value);
    }

    document.getElementById("total_cart_value").textContent = totalQuantity;
    sessionStorage.setItem('cartTotalQuantity', totalQuantity);

    // Update the quantity displayed in the header
    let headerQuantity = document.getElementById("total_cart_value");
    if (headerQuantity) {
        headerQuantity.textContent = totalQuantity;
    }
}

// console.log(sessionStorage.getItem("cartTotalQuantity"))

window.onload = async function () {
    await calculateCartTotals();
    const cartTotalQuantity = sessionStorage.getItem('cartTotalQuantity');
    if (cartTotalQuantity) {
        document.getElementById("total_cart_value").textContent = cartTotalQuantity;
    }

    const placeOrderButton = document.getElementById("place_order_button");
    placeOrderButton.addEventListener("click", function() {
        sessionStorage.clear()
    });
};

//--------- SEARCH BAR SHORTCUT -----------

document.addEventListener("keyup", e => {
    if ( e.key === '/') {
        document.getElementById("browser-input").focus();
    }
})


//--------- login----------

function login() {
    let email = document.getElementById("Input_Email").value;
    let password = document.getElementById("Input_Password").value;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/user/login", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                // Successful response, redirect to the homepage
                window.location.href = "/";
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