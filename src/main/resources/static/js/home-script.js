// Store CSRF token and header name in JavaScript variables
const csrfToken = document.querySelector('meta[name="_csrf"]').content;
const csrfHeader = document.querySelector('meta[name="_csrf_header"]').content;
let lists = [];
let tasks = [];
let notes = [];
/*
let tasks = [
    { id: 1, listId: 1, title: 'Finish report', dueDate: '2025-09-10', status: 'To Do', priority: 'Low', created: new Date() },
    { id: 2, listId: 1, title: 'Team meeting', dueDate: '2025-09-11', status: 'Done', priority: 'Medium', created: new Date() }
];
let notes = [
    { id: 1, taskId: 1, description: 'Include Q3 data', status: 'To Do', created: new Date() }
];
*/
let selectedListId = null;
let previousSelectedListId = null;
let selectedTaskId = null;
let selectedPriority = 'None'; // Track selected priority for new tasks
let editingListId = null; // Tracks the ID of the list being edited (null for adding)


// FIRST DIV
// Renders the list of task lists in the sidebar, updating the UI with list items and their count.
function renderLists() {
    const listItemsContainer = document.getElementById('listItems');
    const listCount = document.getElementById('listCount');
    listCount.textContent = lists.length;
    listItemsContainer.innerHTML = '';
    lists.forEach(list => {
        const listItem = document.createElement('div');
        listItem.className = `list-item ${selectedListId === list.id ? 'selected' : ''}`;
        listItem.innerHTML = `
            <span class="color-dot" style="background-color: ${list.color}"></span>
            <span class="list-title">${list.title}</span>
            <button class="list-menu-btn" onclick="toggleListMenu(${list.id}, event)" title="List Options">⋮</button>
            <div class="list-menu" id="listMenu-${list.id}">
                <div class="list-menu-item" onclick="editList(${list.id})">Edit</div>
                <div class="list-menu-item delete" onclick="deleteList(${list.id})">Delete</div>
            </div>
            <button class="add-list-btn" style="display: none;">+</button>
        `;
        listItem.onclick = (e) => {
            if (!e.target.classList.contains('list-menu-btn') && !e.target.closest('.list-menu')) {
                selectList(list.id);
            }
        };
        listItem.tabIndex = 0;
        listItem.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectList(list.id);
            }
        });
        listItemsContainer.appendChild(listItem);
    });
}

// Toggles the visibility of the new list input field and adds a new list when confirmed.
function toggleAddListInput() {
    const input = document.getElementById('newListInput');
    if (input.style.display === 'none') {
        input.style.display = 'block';
        input.focus();
    } else {
        if (input.value.trim()) {
            const newList = {
                id: lists.length + 1,
                title: input.value.trim(),
                color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
                userId: 1
            };
            lists.push(newList);
            input.value = '';
            input.style.display = 'none';
            renderLists();
        }
    }
}

// Selects a list, updates the selected list ID, and refreshes the tasks and task details UI.
async function selectList(listId) {
    selectedListId = listId;

    if (previousSelectedListId) {
        selectedTaskId = null
        ;
    } else {
        previousSelectedListId = selectedListId;
    }

    const list = lists.find(l => l.id === listId);
    if (lists.length === 0) {
        document.getElementById('selectedListTitle').textContent = 'Create a list';
    } else {
        document.getElementById('selectedListTitle').textContent = list ? list.title : 'Select a List';
    }
    localStorage.setItem('selectedListId', listId);
    renderLists();
    await renderTasks();
    renderTaskDetails();
}

// Shows the add list pop-up form
function showAddListPopup() {
    const popup = document.getElementById('addListPopup');
    const titleInput = document.getElementById('newListTitle');
    popup.style.display = 'flex';
    titleInput.focus();
}

// Hides the add list pop-up form
function hideAddListPopup() {
    const popup = document.getElementById('addListPopup');
    const titleInput = document.getElementById('newListTitle');
    const colorInput = document.getElementById('newListColor');
    const popupTitle = document.getElementById('popupTitle');
    const submitBtn = document.getElementById('submitListBtn');
    titleInput.value = '';
    colorInput.value = '#000000';
    popup.style.display = 'none';
    editingListId = null;
    popupTitle.textContent = 'Add New List';
    submitBtn.textContent = 'Add';
    // Hide all menus
    document.querySelectorAll('.list-menu').forEach(m => m.classList.remove('show'));
}

// Adds a new list from the pop-up form
async function saveList() {
    const titleInput = document.getElementById('newListTitle');
    const colorInput = document.getElementById('newListColor');
    const title = titleInput.value.trim();

    if (title) {
        try {
            if (editingListId) {
                // Update existing list
                const list = lists.find(l => l.id === editingListId);
                if (list) {
                    list.title = title;
                    list.color = colorInput.value;
                    await updateList(list);
                    console.log('List successfully updated:', list);
                }
            } else {
                // Add new list
                const newList = {
                    title: title,
                    color: colorInput.value,
                    userId: 1,
                    status: 'Ongoing',
                    created_date: new Date().toISOString().split('T')[0]
                };
                const response = await fetch(`/to-do-list/list`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        [csrfHeader]: csrfToken // Include CSRF token
                    },
                    body: JSON.stringify({
                        user_id: newList.userId,
                        title: newList.title,
                        color: newList.color,
                        status: newList.status,
                        created_date: newList.created_date
                    })
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                newList.id = data.id;
                lists.push(newList);
                console.log('List successfully added:', data);
            }

            titleInput.value = '';
            colorInput.value = '#000000';
            document.getElementById('addListPopup').style.display = 'none';
            document.getElementById('popupTitle').textContent = 'Add New List';
            document.getElementById('submitListBtn').textContent = 'Add';

            await fetchLists();
            if(!editingListId) {
                const latestId = lists.reduce((max, l) => l.id > max ? l.id : max, 0);
                console.log(latestId);
                selectList(latestId);
            }

            editingListId = null;

            renderLists();
            renderTasks();
        } catch (error) {
            console.error('Error saving list:', error);
            alert('Failed to save list. Please try again.');
        }
    } else {
        alert('Please enter a list title.');
    }
}

// Toggles the List Menu (edit and delete)
function toggleListMenu(listId, event) {
    event.stopPropagation(); // Prevent list selection
    const menu = document.getElementById(`listMenu-${listId}`);
    const isShown = menu.classList.contains('show');
    // Hide all menus
    document.querySelectorAll('.list-menu').forEach(m => m.classList.remove('show'));
    // Toggle the clicked menu
    if (!isShown) {
        menu.classList.add('show');
    }
}

// Edit the List (name, color)
function editList(listId) {
    const list = lists.find(l => l.id === listId);
    if (list) {
        editingListId = listId;
        const popup = document.getElementById('addListPopup');
        const titleInput = document.getElementById('newListTitle');
        const colorInput = document.getElementById('newListColor');
        const popupTitle = document.getElementById('popupTitle');
        const submitBtn = document.getElementById('submitListBtn');

        popupTitle.textContent = 'Edit List';
        submitBtn.textContent = 'Update';
        titleInput.value = list.title;
        colorInput.value = list.color;
        popup.style.display = 'flex';
        titleInput.focus();
        // Hide all menus
        document.querySelectorAll('.list-menu').forEach(m => m.classList.remove('show'));
    }
}

// Delete the list
async function deleteList(listId) {
    console.log('delete');
    try {
        await deleteListAPI(listId);
        lists = lists.filter(l => l.id !== listId);
        if (selectedListId === listId) {
            selectedListId = lists.length > 0 ? lists[0].id : null;
            localStorage.setItem('selectedListId', selectedListId || '');
            selectList(selectedListId);
            await renderTasks();
            renderTaskDetails();
        }
        await fetchLists();
        renderLists();
        // Hide all menus
        document.querySelectorAll('.list-menu').forEach(m => m.classList.remove('show'));
    } catch (error) {
        console.error('Error deleting list:', error);
        alert('Failed to delete list. Please try again.');
    }
}

// SECOND DIV
// Renders the tasks for the selected list, categorizing them into ongoing and completed tasks.
async function renderTasks() {
    await fetchTasks();

    const ongoingTasks = document.getElementById('ongoingTasks');
    const completedTasks = document.getElementById('completedTasks');
    const ongoingCategory = ongoingTasks.closest('.task-category');
    const completedCategory = completedTasks.closest('.task-category');
    ongoingTasks.innerHTML = '';
    completedTasks.innerHTML = '';

    // Filter tasks for the selected list
    const filteredTasks = tasks.filter(t => t.list_id === selectedListId);
    const ongoing = filteredTasks.filter(t => t.status !== 'Done');
    const completed = filteredTasks.filter(t => t.status === 'Done');

    // Toggle visibility of categories based on task counts
    ongoingCategory.classList.toggle('hidden', ongoing.length === 0);
    completedCategory.classList.toggle('hidden', completed.length === 0);

    // Helper function to create task item
    function createTaskItem(task, container) {
        const taskItem = document.createElement('div');
        taskItem.className = `task-item ${task.status === 'Done' ? 'completed' : ''} ${selectedTaskId === task.id ? 'selected' : ''}`;

        // Format date to mm-dd-yy
        let formattedDate = '';
        if (task.due_date) {
            const date = new Date(task.due_date);
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const year = String(date.getFullYear()).slice(-2);
            formattedDate = `${month}-${day}-${year}`;
        }

        taskItem.innerHTML = `
        <input type="checkbox" ${task.status === 'Done' ? 'checked' : ''} onchange="toggleTaskStatus(${task.id}, this.checked)">
        <span class="task-title" contenteditable="true" onblur="updateTaskTitle(${task.id}, this.textContent)">${task.title}</span>
        <div class="task-meta">
            <div class="date-container">
                ${task.due_date ? `<span class="task-date">${formattedDate}</span>` : '<span class="task-date"></span>'}
                <div class="date-edit-container">
                    <input type="date" class="task-date-input" value="${task.due_date || ''}">
                </div>
            </div>
            <div class="priority-container">
                <span class="priority-circle ${task.priority.toLowerCase()}" data-task-id="${task.id}"></span>
                <div class="priority-edit-container">
                    <div class="priority-menu" data-task-id="${task.id}">
                        <div class="priority-option" data-priority="High" onclick="updateTaskPriority(${task.id}, 'High')">
                            <span class="priority-circle high"></span>High
                        </div>
                        <div class="priority-option" data-priority="Medium" onclick="updateTaskPriority(${task.id}, 'Medium')">
                            <span class="priority-circle medium"></span>Medium
                        </div>
                        <div class="priority-option" data-priority="Low" onclick="updateTaskPriority(${task.id}, 'Low')">
                            <span class="priority-circle low"></span>Low
                        </div>
                        <div class="priority-option" data-priority="None" onclick="updateTaskPriority(${task.id}, 'None')">
                            <span class="priority-circle none"></span>None
                        </div>
                    </div>
                </div>
            </div>
            <button class="delete-task-btn" onclick="deleteTask(${task.id})">Delete</button>
        </div>
    `;

        taskItem.onclick = (e) => {
            if (
            e.target.type !== 'checkbox' &&
            e.target.className !== 'task-title' &&
            !e.target.closest('.date-container') &&
            !e.target.closest('.priority-container') &&
            !e.target.classList.contains('delete-task-btn')
            ) {
                selectTask(task.id);
            }
        };

        // Date editing
        const dateSpan = taskItem.querySelector('.task-date');
        const dateEditContainer = taskItem.querySelector('.date-edit-container');
        const dateInput = taskItem.querySelector('.task-date-input');
        dateSpan.addEventListener('click', () => {
            console.log('Date span clicked for task:', task.id);
            dateSpan.classList.add('editing');
            dateEditContainer.classList.add('editing');
            dateInput.focus();
        });
        dateInput.addEventListener('change', () => {
            console.log('Date changed for task:', task.id, 'New date:', dateInput.value);
            updateTaskDueDateInList(task.id, dateInput.value);
            dateSpan.classList.remove('editing');
            dateEditContainer.classList.remove('editing');
        });
        dateInput.addEventListener('blur', () => {
            dateSpan.classList.remove('editing');
            dateEditContainer.classList.remove('editing');
        });

        // Priority editing
        const priorityCircle = taskItem.querySelector('.priority-circle');
        const priorityEditContainer = taskItem.querySelector('.priority-edit-container');
        const priorityMenu = taskItem.querySelector('.priority-menu');
        priorityCircle.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Priority circle clicked for task:', task.id);
            priorityCircle.classList.add('editing');
            priorityEditContainer.classList.add('editing');
            priorityMenu.classList.toggle('show');
        });

        // Add Enter key listener to save title
        const taskTitle = taskItem.querySelector('.task-title');
        taskTitle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                console.log('Task title updated for task:', task.id);
                updateTaskTitle(task.id, e.target.textContent);
                e.target.blur();
            }
        });
        taskTitle.addEventListener('blur', () => {
            console.log('Task title blurred for task:', task.id);
            updateTaskTitle(task.id, taskTitle.textContent);
        });

        container.appendChild(taskItem);
    }

    // Render ongoing tasks
    ongoing.forEach(task => createTaskItem(task, ongoingTasks));

    // Render completed tasks
    completed.forEach(task => createTaskItem(task, completedTasks));
}

// Toggles the visibility of the priority dropdown menu for adding a new task and resets other priority menu states.
function togglePriorityMenu() {
    const menu = document.getElementById('priorityMenu');
    menu.classList.toggle('show');

    const priorityMenus = document.querySelectorAll('.priority-menu');
    const priorityButtons = document.querySelectorAll('.priority-btn, .priority-circle');

    // Also reset editing states for task priority menus
    document.querySelectorAll('.priority-circle').forEach(circle => circle.classList.remove('editing'));
    document.querySelectorAll('.priority-edit-container').forEach(container => container.classList.remove('editing'));
}

// Toggles the visibility of the priority dropdown menu for adding a new task (debug logging version).
function toggleAddTaskPriorityMenu() {
    console.log('Toggling add-task priority menu');
    const menu = document.getElementById('priorityMenu');
    menu.classList.toggle('show');
}

// Updates the priority button's appearance based on the currently selected priority for a new task.
function updatePriorityButton() {
    const priorityBtn = document.querySelector('.priority-btn .priority-circle');
    priorityBtn.className = `priority-circle ${selectedPriority.toLowerCase()}`;
}

// Updates the due date of a task in the task list and refreshes the UI.
async function updateTaskDueDateInList(taskId, newDueDate) {
    console.log('Updating due date for task:', taskId, 'to:', newDueDate);
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.due_date = newDueDate || null;

        await updateTasks(task);

        renderTasks();
        if (selectedTaskId === taskId) renderTaskDetails();
    }
}

// Updates the priority of a task in the tasks section and refreshes the UI.
async function updateTaskPriority(taskId, newPriority) {
    console.log('Updating priority for task:', taskId, 'to:', newPriority);
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.priority = newPriority;
        // Hide all priority menus and reset editing state
        document.querySelectorAll('.priority-menu').forEach(menu => menu.classList.remove('show'));
        document.querySelectorAll('.priority-circle').forEach(circle => circle.classList.remove('editing'));
        document.querySelectorAll('.priority-edit-container').forEach(container => container.classList.remove('editing'));

        await updateTasks(task);
        renderTasks();
        if (selectedTaskId === taskId) renderTaskDetails();
    }
}

// Updates the title of a task and refreshes the UI.
async function updateTaskTitle(taskId, newTitle) {
    console.log('Updating task title for task:', taskId);
    const task = tasks.find(t => t.id === taskId);
    if (task && newTitle.trim()) {
        task.title = newTitle.trim();
        selectTask(taskId); // Ensure task remains selected

        await updateTasks(task);
        renderTasks();
        if (selectedTaskId === taskId) {
            renderTaskDetails();
        }
    } else if (task && !newTitle.trim()) {
        // Revert to original title if empty
        renderTasks();
    }
}

// Adds a new task to the selected list and updates the UI.
async function addTask() {
    if (!selectedListId) return alert('Select a list first');
    const input = document.getElementById('newTaskInput');
    const dueDateInput = document.getElementById('newTaskDueDate');
    if (input.value.trim()) {
        const newTask = {
            list_id: selectedListId,
            title: input.value.trim(),
            status: 'Ongoing',
            priority: selectedPriority,
            created_date: new Date(),
            due_date: dueDateInput.value || null,
            done_date: null
        };
        console.log('Adding new task:', newTask);

        await fetch(`/to-do-list/task`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                [csrfHeader]: csrfToken // Include CSRF token
            },
            body: JSON.stringify({
                list_id: newTask.list_id,
                title: newTask.title,
                status: newTask.status,
                priority: newTask.priority,
                created_date: newTask.created_date,
                due_date: newTask.due_date,
                done_date: newTask.done_date
            })
        })
            .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
            .then(data => {
            console.log('Done adding new Task');
        })
            .catch(error => {
            console.error('Error fetching list:', error);
            throw error; // Re-throw to be caught in init
        });

        input.value = '';
        dueDateInput.value = '';
        selectedPriority = 'None';
        updatePriorityButton();
        document.getElementById('priorityMenu').classList.remove('show');

        await fetchTasks();
        const latestId = tasks.reduce((max, t) => t.id > max ? t.id : max, 0);
        console.log(latestId);
        selectTask(latestId);
        renderTasks();
    }
}

// Toggles the completion status of a task and updates the UI.
async function toggleTaskStatus(taskId, isChecked) {
    const task = tasks.find(t => t.id === taskId);

    if (task) {
        task.status = isChecked ? 'Done' : 'Ongoing';
        task.done_date = isChecked ? new Date().toISOString().split('T')[0] : null;

        // Update Tasks
        await updateTasks(task);

        renderTasks();
        if (selectedTaskId === taskId) renderTaskDetails();
    }
}

// Selects a task and updates the UI to reflect the selection.
function selectTask(taskId) {
    console.log('Selecting task:', taskId);
    selectedTaskId = taskId;
    localStorage.setItem('selectedTaskId', taskId);
    renderTaskDetails();
}

// Updates the due date of the selected task in the task details section and refreshes the UI.
async function updateTaskDueDate() {
    const task = tasks.find(t => t.id === selectedTaskId);
    if (task) {
        task.due_date = document.getElementById('taskDueDate').value;

        await updateTasks(task);

        console.log('Updating task due date in details for task:', selectedTaskId);
        renderTasks();
    }
}

// Toggles the completion status of the selected task in the task details section and updates the UI.
async function toggleTaskCompletion() {
    const task = tasks.find(t => t.id === selectedTaskId);
    console.log('toggleTaskCompletion');
    if (task) {
        task.status = document.getElementById('taskCheckbox').checked ? 'Done' : 'Ongoing';
        console.log('Toggling task completion for task:', selectedTaskId);

        await updateTasks(task);

        renderTasks();
        renderTaskDetails();
    }
}

// Delete the task
async function deleteTask(taskId) {
    try {
        await deleteTaskAPI(taskId);
        tasks = tasks.filter(t => t.id !== taskId);
        if (selectedTaskId === selectedTaskId) {
            selectedTaskId = tasks.length > 0 ? tasks[0].id : null;
            localStorage.setItem('selectedListId', selectedListId || '');
        }

        await fetchTasks();
        await renderTasks();
        renderTaskDetails();
        // Hide all menus
        document.querySelectorAll('.list-menu').forEach(m => m.classList.remove('show'));
    } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task. Please try again.');
    }
}

// THIRD DIV SECTION
// Renders the details of the selected task in the task details section or hides content to make it blank if no task is selected.
async function renderTaskDetails() {
    console.log(selectedTaskId);
    const task = tasks.find(t => t.id === selectedTaskId);
    const taskDetailsHeader = document.querySelector('.task-details-header');
    const notesSection = document.querySelector('.notes-section');
    const selectedTaskTitle = document.getElementById('selectedTaskTitle');
    const taskCheckbox = document.getElementById('taskCheckbox');
    const taskDueDate = document.getElementById('taskDueDate');
    const priorityCircle = document.getElementById('priorityCircle');
    const priorityEditContainer = document.querySelector('.priority-edit-container');
    const priorityMenu = document.getElementById('taskDetailsPriorityMenu');
    const newNoteInput = document.getElementById('newNoteInput');

    if (!task) {
        // Hide content to make task-details blank when no task is selected
        if (taskDetailsHeader) taskDetailsHeader.style.display = 'none';
        if (notesSection) notesSection.style.display = 'none';
        return;
    }

    await fetchTaskNotes();

    // Show and populate task details when a task is selected
    if (taskDetailsHeader) taskDetailsHeader.style.display = 'flex';
    if (notesSection) notesSection.style.display = 'block';
    if (selectedTaskTitle) selectedTaskTitle.textContent = task.title;
    if (taskCheckbox) taskCheckbox.checked = task.status === 'Done';
    if (taskDueDate) taskDueDate.value = task.due_date || '';
    if (priorityCircle) priorityCircle.className = `priority-circle ${task.priority.toLowerCase()}`;
    if (newNoteInput) newNoteInput.value = '';
    if (priorityMenu) priorityMenu.classList.remove('show');
    if (priorityCircle) priorityCircle.classList.remove('editing');
    if (priorityEditContainer) priorityEditContainer.classList.remove('editing');

    // Attach event listener to priority circle
    if (priorityCircle) {
        // Remove existing listeners to prevent duplication
        priorityCircle.replaceWith(priorityCircle.cloneNode(true));
        const newPriorityCircle = document.getElementById('priorityCircle');
        newPriorityCircle.onclick = (e) => {
            e.stopPropagation();
            console.log('Priority circle clicked, task ID:', selectedTaskId);
            console.log('Priority menu before toggle:', priorityMenu.classList.contains('show'));
            newPriorityCircle.classList.add('editing');
            if (priorityEditContainer) {
                priorityEditContainer.classList.add('editing');
            }
            if (priorityMenu) {
                priorityMenu.classList.toggle('show');
                console.log('Priority menu after toggle:', priorityMenu.classList.contains('show'));
            } else {
                console.error('Priority menu not found');
            }
        };
    }

    renderNotes();
}

// Updates the priority of the selected task in the task-details section and refreshes the UI.
function updateTaskDetailsPriority(newPriority) {
    console.log('Updating task-details priority for task:', selectedTaskId, 'to:', newPriority);
    const task = tasks.find(t => t.id === selectedTaskId);
    if (task) {
        task.priority = newPriority;
        // Hide task-details priority menu and reset editing state
        const priorityMenu = document.getElementById('taskDetailsPriorityMenu');
        const priorityCircle = document.getElementById('priorityCircle');
        const priorityEditContainer = priorityCircle.closest('.priority-edit-container');
        priorityMenu.classList.remove('show');
        priorityCircle.classList.remove('editing');
        priorityEditContainer.classList.remove('editing');
        renderTasks();
        renderTaskDetails();
    }
}

// Toggles the task Details Priority Menu
function toggleTaskDetailsPriorityMenu() {
    const menu = document.getElementById('priorityMenu');
    menu.classList.toggle('show');

    const priorityMenus = document.querySelectorAll('.priority-menu');
    const priorityButtons = document.querySelectorAll('.priority-btn, .priority-circle');

    // Also reset editing states for task priority menus
    document.querySelectorAll('.priority-circle').forEach(circle => circle.classList.remove('editing'));
    document.querySelectorAll('.priority-edit-container').forEach(container => container.classList.remove('editing'));
}

// Renders the notes for the selected task in the task details section.
function renderNotes() {
    const notesList = document.getElementById('notesList');
    notesList.innerHTML = '';
    if (selectedTaskId) {
        notes.filter(n => n.task_id === selectedTaskId).forEach(note => {
            const noteItem = document.createElement('div');
            noteItem.className = `note-item ${note.status === 'Done' ? 'completed' : ''}`;
            noteItem.innerHTML = `
                <input type="checkbox" ${note.status === 'Done' ? 'checked' : ''} onchange="toggleNoteStatus(${note.id}, this.checked)">
                <input type="text" value="${note.description}" onblur="updateNote(${note.id}, this.value)">
                <button class="delete-note-btn" onclick="deleteNote(${note.id})">Delete</button>
            `;
            notesList.appendChild(noteItem);
        });
    }
}

// Adds a new note to the selected task and updates the UI.
async function addNote() {
    if (!selectedTaskId) return alert('Select a task first');
    const input = document.getElementById('newNoteInput');
    if (input.value.trim()) {
        const newNote = {
            task_id: selectedTaskId,
            description: input.value.trim(),
            status: 'Ongoing',
            created_date: new Date()
        };

        await fetch(`/to-do-list/task-note`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                [csrfHeader]: csrfToken // Include CSRF token
            },
            body: JSON.stringify({
                task_id: newNote.task_id,
                description: newNote.description,
                status: newNote.status,
                created_date: newNote.created_date
            })
        })
            .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
            .then(data => {
            console.log('Done adding new Note');
        })
            .catch(error => {
            console.error('Error fetching list:', error);
            throw error; // Re-throw to be caught in init
        });

        console.log('Adding new note:', newNote);

        input.value = '';
        await fetchTaskNotes();
        renderNotes();
    }
}

// Updates the description of a note and refreshes the UI.
async function updateNote(noteId, newDescription) {
    const note = notes.find(n => n.id === noteId);
    if (note && newDescription.trim()) {
        note.description = newDescription.trim();

        await updateTaskNotes(note);

        console.log('Updating note:', noteId);
        renderNotes();
    }
}

// Deletes a note and updates the UI.
async function deleteNote(noteId) {
    try {
        console.log('Deleting note:', noteId);
        await deleteTaskNoteAPI(noteId);
        await fetchTaskNotes();
        renderNotes();
    } catch (error) {
        console.error('Error deleting note:', error);
        alert('Failed to delete note. Please try again.');
    }

}

// Toggles the completion status of a note and updates the UI.
async function toggleNoteStatus(noteId, isChecked) {
    const note = notes.find(n => n.id === noteId);
    if (note) {
        note.status = isChecked ? 'Done' : 'Ongoing';

        await updateTaskNotes(note);
        console.log('Toggling note status for note:', noteId);
        renderNotes();
    }
}

// GENERAL SECTION
// Toggles the visibility of the sidebar, collapsing or expanding it.
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar.classList.contains('collapsed')) {
        sidebar.style.display = 'flex';
        setTimeout(() => {
            sidebar.classList.remove('collapsed');
        }, 10);
    } else {
        sidebar.classList.add('collapsed');
        setTimeout(() => {
            sidebar.style.display = 'none';
        }, 300);
    }
}

// Saves the current widths of the sidebar and tasks section to localStorage.
function saveWidths() {
    const sidebar = document.getElementById('sidebar');
    const tasksSection = document.getElementById('tasksSection');
    localStorage.setItem('sidebarWidth', sidebar.style.width || '250px');
    localStorage.setItem('tasksSectionWidth', tasksSection.style.width || '350px');
}

// Loads saved widths for the sidebar and tasks section from localStorage and applies them.
function loadWidths() {
    const sidebar = document.getElementById('sidebar');
    const tasksSection = document.getElementById('tasksSection');
    const savedSidebarWidth = localStorage.getItem('sidebarWidth');
    const savedTasksSectionWidth = localStorage.getItem('tasksSectionWidth');

    if (savedSidebarWidth) {
        sidebar.style.width = savedSidebarWidth;
    }
    if (savedTasksSectionWidth) {
        tasksSection.style.width = savedTasksSectionWidth;
    }
}

// Initiates the resizing process for the sidebar or tasks section.
function startResize(event, elementId) {
    isResizing = true;
    currentElement = document.getElementById(elementId);
    currentElement.style.display = 'flex';
    currentElement.classList.remove('collapsed');
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
}

// Resizes the sidebar or tasks section based on mouse movement, enforcing width constraints.
function resize(event) {
    if (isResizing && currentElement) {
        const viewportWidth = window.innerWidth;
        const maxWidths = {
            'sidebar': viewportWidth * 0.2,
            'tasksSection': viewportWidth * 0.7,
        };
        const minWidth = Math.max(150, viewportWidth * 0.15);
        let newWidth = event.clientX - currentElement.getBoundingClientRect().left;

        if (currentElement.id === 'sidebar') {
            newWidth = Math.max(0, Math.min(newWidth, maxWidths['sidebar']));
        } else if (currentElement.id === 'tasksSection') {
            newWidth = Math.max(minWidth, Math.min(newWidth, maxWidths['tasksSection']));
        }

        if (newWidth >= minWidth || (currentElement.id === 'sidebar' && newWidth >= 0)) {
            currentElement.style.width = `${newWidth}px`;
            saveWidths();
        }
    }
}

// Stops the resizing process and removes event listeners.
function stopResize() {
    isResizing = false;
    currentElement = null;
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
}

// Closes all priority menus when clicking outside of them or their associated buttons.
function handleClickOutside(event) {
    const priorityMenus = document.querySelectorAll('.priority-menu');
    const priorityButtons = document.querySelectorAll('.priority-btn, .priority-circle');
    const listMenus = document.querySelectorAll('.list-menu');
    const listMenuButtons = document.querySelectorAll('.list-menu-btn');
    const isOutside = !event.target.closest('.priority-menu') &&
    !Array.from(priorityButtons).some(btn => btn.contains(event.target)) &&
    !event.target.closest('.list-menu') &&
    !Array.from(listMenuButtons).some(btn => btn.contains(event.target));
    if (isOutside) {
        priorityMenus.forEach(menu => menu.classList.remove('show'));
        document.querySelectorAll('.priority-circle').forEach(circle => circle.classList.remove('editing'));
        document.querySelectorAll('.priority-edit-container').forEach(container => {
            container.classList.remove('editing');
            container.style.display = '';
        });
        listMenus.forEach(menu => menu.classList.remove('show'));
    }
}

// Initializes the application by setting up event listeners, loading saved states, and rendering the UI.
async function init() {
    try {
        await fetchLists();
        const savedListId = localStorage.getItem('selectedListId');
        const savedTaskId = localStorage.getItem('selectedTaskId');
        if (savedListId && lists.some(l => l.id === parseInt(savedListId))) {
            selectedListId = parseInt(savedListId);
            selectedTaskId = parseInt(savedTaskId);
        } else if (lists.length > 0) {
            selectedListId = lists[0].id;
            localStorage.setItem('selectedListId', selectedListId);
        } else {
            selectedListId = null;
        }
        renderLists();
        loadWidths();

        selectList(selectedListId);

        if (selectedTaskId) {
            selectTask(selectedTaskId);
        }
        const addListForm = document.getElementById('addListForm');
        addListForm.addEventListener('submit', (event) => {
            event.preventDefault();
            saveList();
        });
        const taskInput = document.getElementById('newTaskInput');
        taskInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                addTask();
            }
        });
        const noteInput = document.getElementById('newNoteInput');
        noteInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                addNote();
            }
        });
        const priorityOptions = document.querySelectorAll('.add-task .priority-option');
        priorityOptions.forEach(option => {
            option.addEventListener('click', () => {
                selectedPriority = option.getAttribute('data-priority');
                updatePriorityButton();
                document.getElementById('priorityMenu').classList.remove('show');
            });
        });
        updatePriorityButton();
        document.addEventListener('click', handleClickOutside);
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                hideAddListPopup();
            }
        });
    } catch (error) {
        console.error('Initialization failed:', error);
        alert('Failed to load lists. Please try again.');
    }
}


// API CALLS
// Fetch List
function fetchLists() {
    return fetch('/to-do-list/list', { method: 'GET' })
        .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
        .then(data => {
        lists = data;
    })
        .catch(error => {
        console.error('Error fetching list:', error);
        throw error; // Re-throw to be caught in init
    });
}

// Fetch Tasks
function fetchTasks() {
    if (selectedListId) {
        return fetch(`/to-do-list/task/${selectedListId}`, {method: 'GET'})
            .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
            .then(data => {
            console.log("FETCH Task:", data);
            tasks = data;
        })
            .catch(error => {
            console.error('Error fetching task:', error);
            throw error; // Re-throw to be caught in init
        });
    }
}

// Fetch Task Notes
function fetchTaskNotes() {
    return fetch(`/to-do-list/task-note/${selectedTaskId}`, { method: 'GET' })
        .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
        .then(data => {
        console.log("FETCH TASK NOTE:", data);
        notes = data;
    })
        .catch(error => {
        console.error('Error fetching notes:', error);
        throw error; // Re-throw to be caught in init
    });
}

// Update Tasks
async function updateTasks(task) {
    await fetch(`/to-do-list/task`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            [csrfHeader]: csrfToken // Include CSRF token
        },
        body: JSON.stringify({
            id: task.id,
            list_id: task.list_id,
            title: task.title,
            status: task.status,
            priority: task.priority,
            created_date: task.created_date,
            due_date: task.due_date,
            done_date: task.done_date
        })
    })
        .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
        .then(data => {
        console.log('Done');
    })
        .catch(error => {
        console.error('Error fetching list:', error);
        throw error; // Re-throw to be caught in init
    });
}

// Update Task Notes
async function updateTaskNotes(note) {
    await fetch(`/to-do-list/task-note`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            [csrfHeader]: csrfToken // Include CSRF token
        },
        body: JSON.stringify({
            id: note.id,
            task_id: note.task_id,
            description: note.description,
            status: note.status,
            created_date: note.created_date
        })
    })
        .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
        .then(data => {
        console.log('Done');
    })
        .catch(error => {
        console.error('Error fetching list:', error);
        throw error; // Re-throw to be caught in init
    });
}

// Update list
async function updateList(list) {
    await fetch(`/to-do-list/list`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            [csrfHeader]: csrfToken // Include CSRF token
        },
        body: JSON.stringify({
            id: list.id,
            user_id: list.user_id,
            title: list.title,
            color: list.color,
            status: list.status,
            created_date: list.created_date
        })
    })
        .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
        .then(data => {
        console.log('Done');
    })
        .catch(error => {
        console.error('Error fetching list:', error);
        throw error; // Re-throw to be caught in init
    });
}

// Delete List
async function deleteListAPI(listId) {
    await fetch(`/to-do-list/list/delete/${listId}`, {
        method: 'DELETE',
        headers: {
            [csrfHeader]: csrfToken // Include CSRF token
        }
    })
        .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
        .then(data => {
        console.log('Task deleted successfully!');
    })
        .catch(error => {
        console.error('Error deleting list:', error);
        throw error;
    });
}

// Delete Tasks
async function deleteTaskAPI(taskId) {
    await fetch(`/to-do-list/task/delete/${taskId}`, {
        method: 'DELETE',
        headers: {
            [csrfHeader]: csrfToken // Include CSRF token
        }
    })
        .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
        .then(data => {
        console.log('Task deleted successfully!');
    })
        .catch(error => {
        console.error('Error deleting task:', error);
        throw error;
    });
}

// Delete Task note
async function deleteTaskNoteAPI(noteId) {
    await fetch(`/to-do-list/task-note/delete/${noteId}`, {
        method: 'DELETE',
        headers: {
            [csrfHeader]: csrfToken // Include CSRF token
        }
    })
        .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
        .then(data => {
        console.log('Note deleted successfully!');
    })
        .catch(error => {
        console.error('Error deleting note:', error);
        throw error;
    });
}


document.addEventListener('DOMContentLoaded', () => {
    init();
});