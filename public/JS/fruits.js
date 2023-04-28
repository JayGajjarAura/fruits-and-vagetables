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

//___________________________ Dynamic Add and Remove_________________________
let table_num = 0;

function addTermrows() {
    table_num++;

    let TermName = document.getElementById("product_");
    console.log(TermName);
    if (!TermName) {
        console.error("Product element not found");
        return;
    }
    let TermPrice = document.getElementById("price_");
    let TermQty = document.getElementById("qty_");
    let table_numIValue = TermName.value;
    let table_price = TermPrice.value;
    let table_qty = TermQty.value
    let total_val = parseFloat(table_price) * parseFloat(table_qty)
    console.log(total_val)
    

    const MainTbody = document.getElementById("mainTBody");

    const CreateTR = document.createElement('tr');
    CreateTR.id = "CreateTR" + table_num;

    const tdOne = document.createElement('td');
    tdOne.id = "tdOne" + table_num;
    tdOne.className = 'one ps-3';

    const pOne = document.createElement('p');
    pOne.id = "pOne" + table_num;
    pOne.className = 'mb-0';
    pOne.innerText = "0" + table_num;

    const tdTwo = document.createElement('td');
    tdTwo.id = "tdTwo" + table_num;
    tdTwo.className = 'two';

    const pTwo = document.createElement('p');
    pTwo.id = "pTwo" + table_num;
    pTwo.className = 'mb-0';
    pTwo.innerText = table_numIValue;

    const tdThree = document.createElement('td');
    tdThree.id = "tdThree" + table_num;
    tdThree.className = 'three';
    tdThree.innerText = table_price;

    const tdFour = document.createElement('td');
    tdFour.id = "tdFour" + table_num;
    tdFour.className = 'four';
    tdFour.innerText = table_qty;

    const tdFive = document.createElement('td');
    tdFive.id = "tdFive" + table_num;
    tdFive.className = 'text-end pe-3 five';
    tdFive.innerText = total_val;

    const DelButton = document.createElement('button');
    DelButton.id = "DelButton" + table_num;
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

    const tdSix = document.createElement("td");
    tdSix.id = "tdSix" + table_num;
    tdSix.className = "text-end pe-3 six";
    tdSix.appendChild(DelButton);

    tdOne.appendChild(pOne);
    tdTwo.appendChild(pTwo);
    tdFive.appendChild(DelButton);
    CreateTR.appendChild(tdOne);
    CreateTR.appendChild(tdTwo);
    CreateTR.appendChild(tdThree);
    CreateTR.appendChild(tdFour);
    CreateTR.appendChild(tdFive);
    CreateTR.appendChild(tdSix);
    MainTbody.appendChild(CreateTR);
}

// Countdown Timer 

// let deadline = new Date();
// deadline.setHours(deadline.getHours() + 1);

// let x = setInterval(function() {
//     let now = new Date().getTime();
//     let t = deadline - now;
    
//     let hours = Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//     let minutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));
//     let seconds = Math.floor((t % (1000 * 60)) / 1000);
    
//     document.getElementById("hour").innerHTML =hours;
//     document.getElementById("minute").innerHTML = minutes;
//     document.getElementById("second").innerHTML =seconds;
    
//     if (t < 0) {
//         clearInterval(x);
//         document.getElementById("timeup").innerHTML = "TIME UP";
//         document.getElementById("hour").innerHTML ='0';
//         document.getElementById("minute").innerHTML ='0' ;
//         document.getElementById("second").innerHTML = '0'; 
//     }
// }, 1000);