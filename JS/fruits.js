$(document).ready(function () {
    // $(function () {
    //     $("#header").load("/header.html #random")
    // });
    
    //............ Subscribe toast ...............
    $('#myBtn').on('click', function () {
        $('.toast_sub').toast('show')
    });

    //............. ADD TO CART TOAST...........
    $('.add_to_cart_toast').click(function() {
        let cart_toast_info = $(this).parent().find('input').val();
        document.getElementById('add_to_cart_toast').innerHTML = cart_toast_info + " items added to your cart..."

        if (cart_toast_info < 1 ) {
            alert ("Cannot add ZERO quantity in cart ")
        } else {
            $('.cart_toast').toast('show')
        }
    })

    //.......... Add to cart plus btn ............
    $(".plus_btn").click(function() {
        // let currnet_val = parseInt($(this).parent().find('input').val());
        // $(this).parent().find('input').val(currnet_val + 1);
        // console.log(currnet_val);
        
        const txt = $("#txt_" + $(this).attr('id'))
        if (txt.val() == 10) {
            $(this).css('id', 'disable')
            alert("Maximum Value...")
        } else {
            txt.val(parseInt(txt.val()) + 1)
        }
    })

    $(".minus_btn").click(function () {
        // let currnet_val = parseInt($(this).parent().find('input').val());
        // $(this).parent().find('input').val(currnet_val - 1);
        // console.log(currnet_val);
        
        const txt = $("#txt_" + $(this).attr('id'))
        if (txt.val() == 0) {
            $(this).css('id','disable')
        } else {
            txt.val(parseInt(txt.val()) - 1)
        }
    })

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

    $('#reslink').click(function (e) {
        e.preventDefault();
        $.ajax({
            type: "GET",
            url: "more_products.html",
            data: {},
            success: function (data) {
                $('#maincont').html(data);
            }
        });
    });
})