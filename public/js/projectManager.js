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
                            render.rerenderTasksHtml(projectObject.name, result._id);
                            taskManager.init();
                        }
                    });
                } else {
                    render.renderError('Invalid format for project');
                }
                
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