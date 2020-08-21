const userManager = (function(){
    const modals = {
        createSignUpModal: function(){
            const that = this;
            const overlay = $('#overlay'); 
            const openModal = $('#signUpModal'); 
            const close = $('#modalSignUpClose, #overlay'); 
            const modal = $('#modalSignUp'); 

            openModal.click( function(){ 
                that.showModalWindow(overlay, modal);
            });

            close.click( function(){
                that.hideModalWindow(overlay, modal);
            })
        },

        createSignInModal: function(){
            const that = this;
            const overlay = $('#overlay'); 
            const openModal = $('#signInModal'); 
            const close = $('#modalSignInClose, #overlay'); 
            const modal = $('#modalSignIn'); 

            openModal.click( function(){ 
                that.showModalWindow(overlay, modal);
            });

            close.click( function(){ 
                that.hideModalWindow(overlay, modal);
            })
        },

        showModalWindow: function(overlay, modal){
            overlay.fadeIn(400, function(){ 
                modal.css('display', 'block').animate({opacity: 1, top: '50%'}, 200); 
            });
        },

        hideModalWindow: function(overlay, modal){
            modal.animate({opacity: 0, top: '45%'}, 200, function(){ 
                $(this).css('display', 'none');
                overlay.fadeOut(400);
            })
        }   
    };

    const signInUp = {
        on: function(){
            $("#signUpButton").click(function(){
                const[email, pass1, pass2] = $(this).parent().find('input');
                if($(email).val() !== '' && $(pass1).val() !== ''
                && $(email).val().search(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/) !== -1
                && $(pass1).val() === $(pass2).val()){
                    $.ajax({
                        url: "/users/signup",
                        type: "POST",
                        contentType: "application/json",
                        dataType: "json",
                        data: JSON.stringify(createUser($(email).val(), $(pass1).val())),
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem(projectManager.config.userToken),
                        },
                        success: function (result){
                            $('#modalSignUpClose, #overlay').trigger('click');
                            render.renderSuccess('You has signed up successfully');
                        },
                        error: function(){
                            render.renderError("Can't register a new user");
                        }
                    })
                }
            })

            $("#signInButton").click(function(){
                const[email, pass] = $(this).parent().find('input');
                if($(email).val() !== '' 
                && $(email).val().search(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/) !== -1)
                $.ajax({
                    url: "/users/login",
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    data: JSON.stringify(createUser($(email).val(), $(pass).val())),
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem(projectManager.config.userToken),
                    },
                    success: function (result){
                        $('#modalSignInClose, #overlay').trigger('click');
                        render.renderSuccess('You has signed in successfully');
                        localStorage.setItem(projectManager.config.userToken, result.token);
                        render.renderSignButtons();
                        init();
                        projectManager.loadTasksFromServer()
                    },
                    error: function(result){
                        render.renderError("Password or login incorrect");
                    }
                })
            })

            $('#signOut').click(function(){
                $.ajax({
                    url: "/users/currentUser",
                    type: "GET",
                    contentType: "application/json",
                    dataType: "json",
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem(projectManager.config.userToken),
                    },
                    success: function (result){
                        localStorage.setItem(projectManager.config.userToken, '');
                        render.renderSuccess('You has signed out successfully');
                        render.renderSignButtons();
                        init();
                        projectManager.loadTasksFromServer(); 
                    }
                })
                               
            })
        },
    };        
 
    function createUser(email, password){
        return {
            email: email,
            password: password
        };
    }

    function init(){
        modals.createSignUpModal();
        modals.createSignInModal();
        signInUp.on();
    }

    return {
        init: init,
    }
})();