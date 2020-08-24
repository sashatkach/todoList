const projectManager = (function () {
    const config = {
        userToken: "userToken"
    };

    const handler = {
        on: function () {
            $("#addTodoButton").click(function () {
                const newProjectName = $("#addTodoInput").val();
                if(newProjectName !== '' && newProjectName.search(/^[а-яА-ЯёЁa-zA-Z0-9 ,!?]+$/) !== -1){
                    let projectObject = {
                        name : newProjectName
                    }
                    $("#addTodoInput").val('');
                    $.ajax({
                        url: "/projects",
                        type: "POST",
                        contentType: "application/json",
                        dataType: "json",
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem(projectManager.config.userToken),
                        },
                        data: JSON.stringify(projectObject),
                        success: function(result){
                            render.rerenderTasksHtml(projectObject.name, result.id);
                            taskManager.init();
                        }
                    });
                } else {
                    render.renderError('Invalid format for project');
                }
                
            })

            $(".editProject").click(function(){
                const $rootBlock = $(this).parent();
                let currentName = $rootBlock.find('.nameProject').text();
                $nameSection = $rootBlock.find('.nameProject');
                $editSection = $rootBlock.find('.editSectionProject');
    
                $nameSection.css('display', 'none');
                $editSection.css('display', 'inline-block').find('input[type=text]').val(currentName);
                                
                
                $editSection.find('input[type=text]').on('blur', function(){
                    const newProjectName = $(this).val();
                
                    const projectId = $(this).parent().parent().parent().attr("data-project-id");
                                        
                    if(newProjectName !== '' 
                        && newProjectName.search(/^[а-яА-ЯёЁa-zA-Z0-9 ,!?]+$/) !== -1){
                        const updateProjectObject = [{
                            propName: "name",
                            value: newProjectName
                        }];
                        $.ajax({
                            url: "/projects/" + projectId,
                            type: "PUT",
                            contentType: "application/json",
                            dataType: "json",
                            headers: {
                                'Authorization': 'Bearer ' + localStorage.getItem(projectManager.config.userToken),
                            },
                            data: JSON.stringify(updateProjectObject),
                            success: function(result){
                                projectManager.loadTasksFromServer();
                                render.renderSuccess("You have changed project successfully");
                            },
                            error: function(){
                                render.renderError("Can't update current project");
                            }
                        });
                    } else {
                        render.renderError("Invalid format for task name");
                        projectManager.loadTasksFromServer();
                    }
                });

                
            })

            $(".removeProject").click(function(){
                let $parent = $(this).parent();
                $.ajax({
                    url: "/tasks",
                    type: "GET",
                    contentType: "application/json",
                    dataType: "json",
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem(projectManager.config.userToken),
                    },
                    success: function(tasks){
                        console.log(tasks);
                        let projectId = $parent.parent().attr("data-project-id");
                        let arrIdTasksForDelete = []; 
                        tasks.forEach(task => { 
                            if('_id' in task.projectId && task.projectId._id === projectId){
                                arrIdTasksForDelete.push(task._id);
                            }
                        });

                        console.log(arrIdTasksForDelete);

                        arrIdTasksForDelete.forEach(id => {
                            $.ajax({
                                url: "/tasks/" + id,
                                type: "DELETE",
                                contentType: "application/json",
                                dataType: "json",
                                headers: {
                                    'Authorization': 'Bearer ' + localStorage.getItem(projectManager.config.userToken),
                                },
                                success: function(result){
                                    //alert(result);
                                }
                            })
                        });

                        $.ajax({
                            url: "/projects/" + projectId,
                            type: "DELETE",
                            contentType: "application/json",
                            dataType: "json",
                            headers: {
                                'Authorization': 'Bearer ' + localStorage.getItem(projectManager.config.userToken),
                            },
                            success: function(result){
                                projectManager.loadTasksFromServer()
                                render.renderSuccess("You have delete project successfully")
                            }
                        })
                    }
                }) 
            })
        }
    };

    function loadTasksFromServer() {
        render.clearWrapper();
        $.ajax({
            url: "/tasks",
            type: 'GET',
            contentType: "application/json",
            dataType: "json",
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem(projectManager.config.userToken),
            },
            success: function (tasks) {
                //Only projects with tasks render
                //that why need to create projects with empty array of tasks  
                $.ajax({
                    url: "/projects",
                    type: "GET",
                    contentType: "application/json",
                    dataType: "json",
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem(projectManager.config.userToken),
                    },
                    success: function(projects){
                        let projectObject = {};
                    
                        projects.forEach((project) => {
                            projectObject[project._id + " " + project.name] = []
                        })

                        tasks.forEach((task) => {
                            projectObject[task.projectId._id + " " + task.projectId.name] = [];
                        })
                        tasks.forEach((task) => {
                            projectObject[task.projectId._id + " " + task.projectId.name].push(task);
                        });
                        console.log(projectObject);
                        
                        render.clearWrapper();

                        for(let k in projectObject){
                            render.rerenderTasksHtml(k.split(" ")[1], k.split(" ")[0], projectObject[k]);
                        }
                        taskManager.init();
                    }
                });
            }
        });
    }

    function init() {
        loadTasksFromServer();
        handler.on()
    }

    return {
        init: init,
        loadTasksFromServer: loadTasksFromServer,
        config: config,    
    }
})();