const taskManager = (function () {
    function getIdTaskByAttr(that){
        return $(that).parent().prev().prev().attr('data-task-id');
    }

    const handler = {
        on: function () {
            $(".addTaskButton").click(function () {
                let $parent =$(this).parent();
                let text = $parent.find('input').val();
                let projectId = $parent.parent().attr('data-project-id');
                $parent.find('input').val('');
                let newTask = {
                    name: text,
                    deadline: new Date(),
                    done: false,
                    projectId : projectId
                };
                $.ajax({
                    url: "/tasks",
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    data: JSON.stringify(newTask),
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem(projectManager.config.userToken),
                    },
                    success: function(result){
                        if(result.message === "OK"){
                            $.ajax({
                                url: "/tasks/" + result.id,
                                type: "GET",
                                contentType: "application/json",
                                dataType: "json",
                                headers: {
                                    'Authorization': 'Bearer ' + localStorage.getItem(projectManager.config.userToken),
                                },
                                success: function(task){   
                                    console.log(task);
                                    render.rerenderTaskElement($parent, task)
                                    taskManager.init();
                                }
                            })
                        }
                    },
                    error: function(){
                        render.renderError("Can't create a new task");
                    }
                })               
            });
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

            $(".editTask").click(function(){
                
                $rootBlock = $(this).parent().parent();
                let taskId = getIdTaskByAttr(this);
                let currentName = $rootBlock.find('.nameSection').text();
                $nameSection = $rootBlock.find('.nameSection');
                $editSection = $rootBlock.find('.editSection');
    
                $rootBlock.find('.doneSection').css('display', 'none');
                $nameSection.css('display', 'none');
                $editSection.css('display', 'inline-block').find('input[type=text]').val(currentName);
                
                $editSection.find('input[type=text]').on('blur', function(){
                    let newTaskName= $(this).val();
                    if(newTaskName !== '' 
                        && newTaskName.search(/^[а-яА-ЯёЁa-zA-Z0-9 ,!?]+$/) !== -1){
                        let updateTaskObject = [{
                            propName: "name",
                            value: $(this).val()
                        }];

                        $.ajax({
                            url: "/tasks/" + taskId,
                            type: "PUT",
                            contentType: "application/json",
                            dataType: "json",
                            data: JSON.stringify(updateTaskObject),
                            headers: {
                                'Authorization': 'Bearer ' + localStorage.getItem(projectManager.config.userToken),
                            },
                            success: function(result){
                                render.renderSuccess("You have changed name task successfully");
                                projectManager.loadTasksFromServer();
                            },
                            error: function(result){
                                render.renderError("Can't update current task");
                            }
                        });
                    } else {
                        render.renderError("Invalid format for task name");
                        projectManager.loadTasksFromServer();
                    }
                });

                $editSection.find('input[type=datetime-local]').on('blur', function(){
                    let newDateTimeTask = $(this).val();
                    let [newDateTask, newTimeTask] = newDateTimeTask.split('T');
                    
                    //I have local time in american format 
                    //thats why i need to check another format
                    if(newDateTimeTask !== '' && (newDateTask.search(/\d{1,2}-\d{1,2}-\d{4}/) !== -1 
                        || newDateTask.search(/\d{4}-\d{1,2}-\d{1,2}/) !== -1) && newTimeTask.search(/\d{1,2}:\d{2}([ap]m)?/) !== -1) {
                        let updateTaskObject = [{
                            propName: "deadline",
                            value: newDateTimeTask
                        }];
                        $.ajax({
                            url: "/tasks/" + taskId,
                            type: "PUT",
                            contentType: "application/json",
                            dataType: "json",
                            data: JSON.stringify(updateTaskObject),
                            headers: {
                                'Authorization': 'Bearer ' + localStorage.getItem(projectManager.config.userToken),
                            },
                            success: function(resutl){
                                render.renderSuccess("You have changed deadline of task successfully");
                                projectManager.loadTasksFromServer();
                            },
                            error: function(result){
                                render.renderError("Can't change current deadline");
                            }
                        });
                    } else {
                        render.renderError("Invalid format for task deadline");
                        projectManager.loadTasksFromServer();
                    }
                });
            })

            $(".removeTask").click(function(){
                let taskId = getIdTaskByAttr(this);
                $.ajax({
                    url: "/tasks/" + taskId,
                    type: "DELETE",
                    contentType: "application/json",
                    dataType: "json",
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem(projectManager.config.userToken),
                    },
                    success: function(result){
                        render.renderSuccess("Yout have delete task successfully")
                        projectManager.loadTasksFromServer()
                    }
                })
            })

            $(".doneSection [type=checkbox]").click(function(){
                let taskId = $(this).parent().next().attr('data-task-id');
                let updateTaskObject = [{
                    propName: "done",
                    value: $(this).is(":checked")
                }];
                $.ajax({
                    url: "/tasks/" + taskId,
                    type: "PUT",
                    contentType: "application/json",
                    dataType: "json",
                    data: JSON.stringify(updateTaskObject),
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem(projectManager.config.userToken),
                    },
                    success: function(resutl){
                        render.renderSuccess("You have changed state done of task successfully");
                        projectManager.loadTasksFromServer();
                    },
                    error: function(result){
                        render.renderError("Can't change current state");
                    }
                });
            });

            $(".priorityIncrease").click(function(){
                let taskId = getIdTaskByAttr(this);
                $.ajax({
                    url: "/tasks/" + taskId,
                    type: "GET",
                    contentType: "application/json",
                    dataType: "json",
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem(projectManager.config.userToken),
                    },
                    success: function(task, textStatus){
                        alert(textStatus);
                        if(textStatus === 'success'){
                            let objectUpdate = [{
                                propName: "priority",
                                value: task.priority + 1
                            }];
                            $.ajax({
                                url: "/tasks/" + task._id,
                                type: "PUT",
                                contentType: "application/json",
                                dataType: "json",
                                data: JSON.stringify(objectUpdate),
                                headers: {
                                    'Authorization': 'Bearer ' + localStorage.getItem(projectManager.config.userToken),
                                },
                                success: function(task, textStatus){
                                    render.renderSuccess("You increase priority");
                                    projectManager.loadTasksFromServer();
                                },
                                error: function(result){
                                    render.renderError("Wrong format of priority");
                                }
                            })  
                        } else {
                            render.renderError("You fail to increase priority");
                            projectManager.loadTasksFromServer();
                        }
                        
                    }
                });
            });

            $(".priorityDecrease").click(function(){
                let taskId = getIdTaskByAttr(this);
                $.ajax({
                    url: "/tasks/" + taskId,
                    type: "GET",
                    contentType: "application/json",
                    dataType: "json",
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem(projectManager.config.userToken),
                    },
                    success: function(task, textStatus){
                        alert(textStatus);
                        if(textStatus === 'success'){
                            let objectUpdate = [{
                                propName: "priority",
                                value: task.priority - 1
                            }];
                            $.ajax({
                                url: "/tasks/" + task._id,
                                type: "PUT",
                                contentType: "application/json",
                                dataType: "json",
                                data: JSON.stringify(objectUpdate),
                                headers: {
                                    'Authorization': 'Bearer ' + localStorage.getItem(projectManager.config.userToken),
                                },
                                success: function(task, textStatus){
                                    render.renderSuccess("You decrease priority");
                                    projectManager.loadTasksFromServer();
                                },
                                error: function(result){
                                    render.renderError("Wrong format of priority");
                                }
                            })  
                        } else {
                            render.renderError("You fail to decrease priority");
                            projectManager.loadTasksFromServer();
                        }
                        
                    }
                });
            });
        }
    };

    function init() {
        handler.on();
    }

    return {
        init: init
    }
})();