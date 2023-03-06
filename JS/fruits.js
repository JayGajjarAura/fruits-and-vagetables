$(window).on("load", function (e) {
    e.preventDefault()
    $.ajax({
        type: "GET",
        url: "header.html",
        data: {},
        success: function (data) {
            $('#header').html(data);
        }
    });
});

$(window).on("load", function (e) {
    e.preventDefault()
    $.ajax({
        type: "GET",
        url: "footer.html",
        data: {},
        success: function (data) {
            $('#footer').html(data);
        }
    });
});

$(document).ready(function (e) {

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
        })
    })

})


//___________________________ Dynamic Add and Remove_________________________
let tn = 0;

function addTermrows() {
    tn++;

    let TermNameInput = document.getElementById("TermNameValue");
    let TNIValue = TermNameInput.value;

    const MainTbody = document.getElementById("mainTBody");

    const CreateTR = document.createElement('tr');
    CreateTR.id = "CreateTR" + tn;

    const tdOne = document.createElement('td');
    tdOne.id = "tdOne" + tn;
    tdOne.className = 'one ps-3';

    const pOne = document.createElement('p');
    pOne.id = "pOne" + tn;
    pOne.className = 'mb-0';
    pOne.innerText = "0" + tn;

    const tdTwo = document.createElement('td');
    tdTwo.id = "tdTwo" + tn;
    tdTwo.className = 'two';

    const pTwo = document.createElement('p');
    pTwo.id = "pTwo" + tn;
    pTwo.className = 'mb-0';
    pTwo.innerText = TNIValue;

    const tdThree = document.createElement('td');
    tdThree.id = "tdThree" + tn;
    tdThree.className = 'three';

    const tdFour = document.createElement('td');
    tdFour.id = "tdFour" + tn;
    tdFour.className = 'four';

    const tdFive = document.createElement('td');
    tdFive.id = "tdFive" + tn;
    tdFive.className = 'text-end pe-3 five';

    const DelButton = document.createElement('button');
    DelButton.id = "DelButton" + tn;
    DelButton.setAttribute("type", "button");
    DelButton.setAttribute("cursor", "pointer");
    DelButton.setAttribute("runat", "server");
    // DelButton.setAttribute("onclick", "DelRow");
    DelButton.className = 'btn btn-sm btn-del-action fw-bold text-danger';
    DelButton.innerText = "Delete";
    DelButton.onclick = function (event) {
        //parse the id of the row from the id
        let rowNr = event.target.id.substr("DelButton".length, event.target.id.length);
        //get the actual row element
        let delRow = document.getElementById("CreateTR" + rowNr);
        delRow.remove();
    };

    tdOne.appendChild(pOne);
    tdTwo.appendChild(pTwo);
    tdFive.appendChild(DelButton);
    CreateTR.appendChild(tdOne);
    CreateTR.appendChild(tdTwo);
    CreateTR.appendChild(tdThree);
    CreateTR.appendChild(tdFour);
    CreateTR.appendChild(tdFive);
    MainTbody.appendChild(CreateTR);
}