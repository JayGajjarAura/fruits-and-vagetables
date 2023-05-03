$(document).ready(function (e) {

    //............ Subscribe toast ...............
    $('#myBtn').on('click', function () {
        $('.toast_sub').toast('show')
    });

    //............. ADD TO CART TOAST...........
    $(".add_to_cart_toast").click(function () {
        let cart_toast_info = $(this).parent().find("input").val();
        console.log(cart_toast_info)

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

    $('.add_to_cart_btn').click(function() {
        document.getElementById('total_cart_value').innerHTML = total_cart_value() 
    })

    //.......... Add to cart plus btn ............
    $(".plus_btn").click(function() {
        let currnet_val = parseInt($(this).parent().find('input').val());
        if(currnet_val == 10) {
            $(this).css('id', 'disable')
            alert('max')
        } else {
            $(this).parent().find('input').val(currnet_val + 1);
        }
        // console.log(currnet_val);
        
        // const txt = $("#qty_" + $(this).attr('id'))
        // if (txt.val() == 10) {
        //     $(this).css('id', 'disable')
        //     alert("Maximum Value...")
        // } else {
        //     txt.val(parseInt(txt.val()) + 1)
        // }
    })

    $(".minus_btn").click(function () {
        let currnet_val = parseInt($(this).parent().find('input').val());
        if(currnet_val == 0) {
            $(this).css('id', 'disable')
            alert('min')
        } else {
            $(this).parent().find('input').val(currnet_val - 1);
        }
        // console.log(currnet_val);
        
        // const txt = $("#qty_" + $(this).attr('id'))
        // if (txt.val() == 0) {
        //     $(this).css('id','disable')
        // } else {
        //     txt.val(parseInt(txt.val()) - 1)
        // }
    })


    //______________________ Show login and signup __________________________

    $(".show-login").click(function () {
      $("#loginPopup").show();
    });
    
    $(".showLogin").click(function () {
        $("#showLogin").show();
        $("#showRegister").hide();
    });

    $(".showRegister").click(function () {
        $("#showRegister").show();
        $("#showLogin").hide();
    });

    $(".close").click(function () {
        $("#loginPopup").hide();
    });
})

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
    calculateCartTotals();
    const cartTotalQuantity = sessionStorage.getItem('cartTotalQuantity');
    if (cartTotalQuantity) {
        document.getElementById("total_cart_value").textContent = cartTotalQuantity;
    }
};
