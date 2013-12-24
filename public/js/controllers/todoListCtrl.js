﻿function todoListCtrl($scope, $log, $location, $route, $routeParams, todoLists, tasks, sharedService) {

    $scope.isCollapsed = {};
    $scope.buttonText = 'Create';
    $scope.query = "";
    $scope.loaded = false;
    $scope.doneEntriesPresent = false;
    $scope.formOn = false;
    $scope.tasksPresent = false;
    $scope.doneTasksPresent = false;

    //Spinner
    var opts = {
        lines: 13, // The number of lines to draw
        length: 20, // The length of each line
        width: 10, // The line thickness
        radius: 30, // The radius of the inner circle
        corners: 1, // Corner roundness (0..1)
        rotate: 0, // The rotation offset
        direction: 1, // 1: clockwise, -1: counterclockwise
        color: '#000', // #rgb or #rrggbb or array of colors
        speed: 1, // Rounds per second
        trail: 60, // Afterglow percentage
        shadow: false, // Whether to render a shadow
        hwaccel: false, // Whether to use hardware acceleration
        className: 'spinner', // The CSS class to assign to the spinner
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        top: 'auto', // Top position relative to parent in px
        left: 'auto' // Left position relative to parent in px
    };
    var target = document.getElementById('spinner');
    var spinner = new Spinner(opts).spin(target);

    $scope.searchNotDone = function (item) {
        return $scope.search(item, false);
    };

    $scope.searchDone = function (item) {
        return $scope.search(item, true);
    };

    $scope.search = function (item, isDone) {
        if (item.done == isDone) {
            if ($scope.query == "") {
                return true;
            }
            return false;
        }
        return false;
    };
    
    function isDefined(x) {
        var undefined;
        return x !== undefined;
    }

    function createList() {
        $scope.isCollapsed = true;
        var newList = new todoLists($scope.newlist);
        newList.$create(
            function (list) { //success
                if (!list)
                    $log.log('Impossible to create new todoList entry');
                else {
                    $scope.data.lists.push(list);
                    $location.path('/todoList/home');
                }
            },
            function (err) { //error
            });
    };

    function updateList(list, next) {
        $scope.isCollapsed = true;
        var id = list._id;
        list.$update({ Id: id }, 
            function (list) { //success
                if (!list)
                    $log.log('Impossible to update todoList entry');
                next();
            },
            function (err) { //error
            });
    };

    function createTask() {
        $scope.isCollapsed = true;;
        var newTask = new tasks($scope.newTask);
        newTask.$create( //TODO deplacer la creation d'une tache en backend pour eviter des erreurs ici avec Angular. Appeler directement addtask ou on cree la tache puis on l'ajoute.
            function (task) { //success
                if (!task)
                    $log.log('Impossible to create new task entry');
                else {
                    $scope.data.list.$addtask({ Id: sharedService.data.list._id, TaskId: task._id },
                        function (list) { //success
                            sharedService.data.list = list;
                            $scope.tasksPresent = true;
                            $scope.newTask = {};
                        },
                        function (list) { //error
                            $scope.newTask = {};
                        });
                }
            },
            function (err) { //error
            });
    };
    
    function updateTask(task, next) {
        $scope.isCollapsed = true;
        var id = list._id;
        task.update({ Id: id }, 
            function (task) { //success
                if (!task)
                    $log.log('Impossible to update task entry');
                next();
            },
            function (err) { //error
            });
    };
    
    $scope.initLists = function () {
        $scope.data = sharedService.data;
        $scope.isCollapsed = true;
        todoLists.query(
            function (res) { //success
                $scope.data.lists = res;
                $scope.loaded = true;
                spinner.stop();
            },
            function (err) { //error
            });
    };

    $scope.showDetails = function(listItem)
    {
        $scope.data.list = listItem;
        $location.path('/todoList/details');
    };

    $scope.initTasks = function () {
        $scope.data = sharedService.data;
        if($scope.data.list.items.length > 0) { $scope.tasksPresent = true; }
        for (idx in $scope.data.list.items) {
            if ($scope.data.list.items[idx].done) { $scope.doneTasksPresent = true; }
        }
    }

    $scope.action = function () {
        if ($scope.buttonText == 'Create')
            createList();
        else
            updateList($scope.newlist);
    };

    $scope.actionTask = function () {
        if ($scope.buttonText == 'Create')
            createTask();
        else
            updateTask($scope.newtask);
    };
    
    $scope.cancel = function () {
        $scope.isCollapsed = true;
    };

    $scope.removeList = function (list,e) {
        if (e) {
            e.preventDefault(); //pour empecher que le content soit développé
            e.stopPropagation();
        }
        var id = list._id;
        list.$remove({ Id: id },
            function (list) { //success
                for (idx in $scope.data.lists) {
                    if ($scope.data.lists[idx] == list) {
                        $scope.data.lists.splice(idx, 1);
                    }
                }
            },
            function (err) { //error
            });
    };

    $scope.editList = function (list, e) {
        if (e) {
            e.preventDefault(); //pour empecher que le content soit développé
            e.stopPropagation();
        }
        $scope.newlist = list;
        $scope.buttonText = 'Update';
        $scope.isCollapsed = false;
    };

    $scope.removeTask = function (task) {
        var id = task._id;
        tasks.delete({ Id: id }, 
            function (task) { //success
                for (idx in $scope.data.list.items) {
                    if ($scope.data.list.items[idx]._id == id) {
                        $scope.data.list.items.splice(idx, 1);
                    }
                }
            },
            function (err) { //error
            });
    };

    $scope.editTask = function (task, e) {
        if (e) {
            e.preventDefault(); //pour empecher que le content soit développé
            e.stopPropagation();
        }
        $scope.newtask = task;
        $scope.buttonText = 'Update';
        $scope.isCollapsed = false;
    };

    $scope.showNewListPanel = function () {
        $scope.newlist = {};
        $scope.buttonText = 'Create';
        $scope.isCollapsed = false;
    };

    $scope.showNewTaskPanel = function () {
        $scope.newtask = {};
        $scope.buttonText = 'Create';
        $scope.isCollapsed = false;
    };

    $scope.chgState = function (item) {
        var id = item._id;
        item.done = !item.done;
        tasks.update({ Id: id },
            function (entry) { //success
                if (!entry)
                    $log.log('Impossible to update todoList entry');
            },
            function (err) { //error
            });
    };
}