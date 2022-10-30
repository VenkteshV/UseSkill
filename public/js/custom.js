$(function() {

  var badge = parseInt($('.badge').html());
  console.log(badge);

  $('#promocodeButton').on('click', function() {

    var input = $('#code').val();
    if (input === '') {
      return false;
    } else {
      $.ajax({
        type: 'POST',
        url: '/promocode',
        data: {
          promocode: input
        },
        success: function(data) {
          console.log(data);
          if (data === 0) {
            $('#promocodeResponse').html("Code Doesn't exist");
          } else {
            $('#promocodeButton').html('Applied');
            $('#promocodeButton').prop('disabled', true);
            $('#promocodeResponse').html("Successfully Applied the code!");
            $('#totalPrice').html(data);
          }
        }
      });
    }
  });


  $('#add-to-cart').on('click', function() {
    var gig_id = $('#gig_id').val();

    if (gig_id === '') {
      return false;
    } else {
      $.ajax({
        type: 'POST',
        url: '/add-to-cart',
        data: {
          gig_id: gig_id
        },
        success: function(data) {
          if(data !=="Please signup or login to continue")
          badge += 1;
          $('.badge').html(badge);
          $('#code').addClass('alert alert-success').html(data);
        }
      });
    }
  });

  $('.remove-item').on('click', function() {
    var gig_id = $(this).attr('id');
    console.log(gig_id);
    if (gig_id === '') {
      return false;
    } else {
      $.ajax({
        type: 'POST',
        url: '/remove-item',
        data: {
          gig_id: gig_id
        },
        success: function(data) {
          //console.log('***&',data);
          var subTotal = parseInt($('#subTotal').html());
          subTotal -= data.price;
          if (subTotal === 0) {
            $('.cart').empty();
            $('.cart').html('Cart is empty');

          } else {
            $('#subTotal').html(subTotal);
            $('#totalPrice').html(data.totalPrice);
          }

          badge -= 1;
          $('.badge').html(badge);
          $('#' + gig_id).remove();
        }
      });
    }
  });



});
