$(document).ready(function (e) {

    //............ Subscribe toast ...............
    $('#myBtn').on('click', function () {
        $('.toast_sub').toast('show')
    });

    //............. ADD TO CART TOAST...........
    $(".add_to_cart_toast").click(async function () {
    let cart_toast_info = $(this).parent().find("input").val();

    // Get the product data from your data source
    const productId = $(this).data('product-id'); // 'data-product-id' attribute on the button
    const productData = await getProductData(productId); // implement this function to fetch product data from your data source

    // Create a new Product instance with the retrieved product data
    const newProduct = new Product({
        name: productData.name,
        quantity: cart_toast_info,
        price: productData.price,
    });

    // Save the new product to the database
    try {
        const savedProduct = await newProduct.save();
        console.log(savedProduct); // Log the saved product to the console
    } catch (error) {
        console.error(error); // Handle any errors that may occur
    }

    // Create a new Cart instance with the user's ID and the new Product instance
    const newCart = new Cart({
        items: [{
            user: req.user._id, // assuming you have a 'user' property on the request object
            product: newProduct._id,
            quantity: cart_toast_info,
            price: productData.price,
        }],
    });

    // Save the new cart to the database
    try {
        const savedCart = await newCart.save();
        console.log(savedCart); // Log the saved cart to the console
    } catch (error) {
        console.error(error); // Handle any errors that may occur
    }

    document.getElementById("add_to_cart_toast").innerHTML =  cart_toast_info + " items added to your cart...";

    if (cart_toast_info < 1) {
        alert("Cannot add ZERO quantity in cart ");
    } else {
        $(".cart_toast").toast("show");

    }
});

    //.......... Add to cart plus btn ............
    $(".plus_btn").click(function() {
        // let currnet_val = parseInt($(this).parent().find('input').val());
        // $(this).parent().find('input').val(currnet_val + 1);
        // console.log(currnet_val);
        
        const txt = $("#qty_" + $(this).attr('id'))
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
        
        const txt = $("#price_" + $(this).attr('id'))
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
            url: "/more_products.hbs",
            data: {},
            success: function (data) {
                $('#maincont').html(data);
            }
        })
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

    // $('#btnToaddTermRows').click(function() {
    //     let grade = $('#product_').val();
    //     let price = $('#price_').val();
    //     let qty = $('#qty_').val();
    //     let newRow = $('<tr><td>' + grade + '</td><td>' + price + '</td><td>' + qty + '</td></tr>');
    //     $('#myTable').append(newRow);
    // });
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

// function addToCart(button) {
//   const productTitle = button.parentNode.parentNode.querySelector('.card-title').textContent;
//   console.log('Product added to cart:', productTitle);
// }



// document.addEventListener("DOMContentLoaded", function () {
//   // your code here

//   let table = document.getElementById("myTable");

//   document
//     .getElementById("btnToaddTermRows")
//     .addEventListener("click", function () {
//       // Get references to the input text boxes
//       let gradeInput = document.getElementById("product_");
//       let priceInput = document.getElementById("price_");
//       let qtyInput = document.getElementById("qty_");

//       // Get the values entered by the user
//       let grade = gradeInput.value;
//       let price = Number(priceInput.value);
//       let qty = Number(qtyInput.value);
//       let totalCartVal = price * qty;
//       console.log(totalCartVal);

//       // Create a new row element and populate it with the user input
//       let newRow = table.insertRow();
//       let gradeCell = newRow.insertCell(0);
//       let priceCell = newRow.insertCell(1);
//       let qtyCell = newRow.insertCell(2);
//       let totalCell = newRow.insertCell(3);

//       gradeCell.innerHTML = grade;
//       priceCell.innerHTML = price;
//       qtyCell.innerHTML = qty;
//       totalCell.innerHTML = totalCartVal;
//     });
// });