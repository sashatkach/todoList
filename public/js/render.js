const render = (function () {
    function clearWrapper(){
        $("#wrapper").html('');
    }

    function renderSignButtons(){
        $("#signUpModal, #signInModal, #signOut").remove();
        if(!localStorage.getItem(projectManager.config.userToken)){
            $(`<button id="signUpModal">Sign up</button>
            <button id="signInModal">Sign in</button>`).insertBefore('#overlay')
        } else {
            $(`<button id="signOut">Sign out</button>`).insertBefore("#overlay");
        }
    };

    function rerenderTasksHtml(nameOfProject, idProject, tasks = []) {
        $("#wrapper").append(`<div class='todoWrapper' data-project-id=${idProject}>
        <div class='heading'>
            <i class='fas fa-calendar-alt'></i>
            <span class="nameProject">${nameOfProject.trim()}</span>
            <div class="editSectionProject">
                <input type="text">
            </div>
            <i class='fas fa-pencil-alt editProject'></i>
            <i class='fas fa-trash removeProject'></i>
        </div>
        <div class='inputNewTask'>
            <i class='fas fa-plus plus'></i>
            <input class='inputTask' type='text' placeholder='Start typing here to create a task'>
            <button class='addTaskButton'>Add task</button>
        </div>
        <div class='tasks'>
            ${rerenderTasksElements(tasks)}
        </div>
    </div>`);
    }

    function rerenderTasksElements(tasks) {
        let tmpHtmlBlock = "";
        tasks.forEach(function (task) {
            let checked = task.done ? "checked" : "";
            tmpHtmlBlock += `<div class="wrapperTask">
                <div class="doneSection"><input type="checkbox" id=${task._id} ${checked}></div>
                <div class="nameSection" data-task-id=${task._id}><label for=${task._id}>${task.name}</label></div>
                <div class="editSection">
                    <input type="text">
                    <input type="datetime-local">
                </div>
                <div class="changeSection">
                    <i class="fa fa-sort-desc priorityDecrease" aria-hidden="true"></i>
                    <i class="fa fa-sort-asc priorityIncrease" aria-hidden="true"></i>
                    <i class='fas fa-pencil-alt editTask'></i>
                    <i class='fas fa-trash removeTask'></i>
                </div>
            </div>`;
        })
        return tmpHtmlBlock;
    }
    
    function rerenderTaskElement($element, task) {
        let checked = task.done ? "checked" : "";
        $element.parent().find('.tasks').append(`
        <div class="wrapperTask">
            <div class="doneSection"><input type="checkbox" id="${task._id} ${checked}"></div>
            <div class="nameSection" data-task-id=${task._id}><label for="done">${task.name}</label></div>
            <div class="editSection">
                <input type="text">
                <input type="datetime-local">
            </div>
            <div class="changeSection">
                <i class="fa fa-sort-desc priorityDecrease" aria-hidden="true"></i>
                <i class="fa fa-sort-asc priorityIncrease" aria-hidden="true"></i>
                <i class='fas fa-pencil-alt editTask'></i>
                <i class='fas fa-trash removeTask'></i>
            </div>
        </div>`);
    }

    function renderError(errorName){
        $("#alert").css("display", "block").addClass("alert-danger").removeClass("alert-success").text(errorName);
    }

    function renderSuccess(successName){
        $("#alert").css("display", "block").addClass("alert-success").removeClass("alert-danger").text(successName);
    }

    
    return {
        rerenderTasksHtml: rerenderTasksHtml,
        rerenderTaskElement: rerenderTaskElement,
        clearWrapper: clearWrapper,
        renderError: renderError,
        renderSuccess: renderSuccess,
        renderSignButtons: renderSignButtons,
    };
})();