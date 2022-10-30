$(document).ready(function() {
    var max_fields      = 6; //maximum input boxes allowed
    var wrapper         = $(".input_fields_wrap"); //Fields wrapper
    var add_button      = $(".add_field_button"); //Add button ID

    var x = 1; //initlal text box count
    $(add_button).click(function(e){ //on add input button click
      console.log('here$$');
        e.preventDefault();
        if(x < max_fields){ //max input box allowed
            x++; //text box increment
            //$(wrapper).append('<div><input type="text" name="languages[]" required/><select class="form-control language_level" name="level[]" required> <option>Beginner</option><option>Intermediate</option><option>Expert</option></select><a href="#" class="remove_field">Remove</a></div>'); //add input box
            $(wrapper).append('<div><input type="text" class="textbox-height" name="languages[]" required/>&nbsp &nbsp &nbsp<select class="form-control language_level display_selected" name="level[]" required> <option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Expert">Expert</option></select>&nbsp<a href="#" class="remove_field">Remove</a></div><br />');
           }
    });

    $(".display_selected").each(function() {
        $(this).val(this.getAttribute("value"));
    });

    $(wrapper).on("click",".remove_field", function(e){ //user click on remove text
        e.preventDefault(); $(this).parent('div').remove(); x--;
    })
});
