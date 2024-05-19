// Пишем основной код внутри DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    const $formAdd = document.querySelector('.js-form-add');
    const $mainList = document.querySelector('.js-main-list');
    const $filterBox = document.querySelector('.js-filter-box');
    const $filterButtons = document.querySelectorAll('.js-filter-btn');
    const $btnDeleteAllCompleted = document.querySelector('.js-delete-all-completed');
    const $checkboxSelectAllTasks = document.querySelector('.js-checkbox-select-all');
    const $pagination = document.querySelector('.pagination');

   

    // Добавление задачи
    function onAddTask(event) {
        event.preventDefault();
        const $formAddInput = event.target.querySelector('.js-personal-input');
        const valueText = $formAddInput.value.trim();
        const checked = $checkboxSelectAllTasks.checked ? 'checked' : '';

        if (valueText) {
            const htmlTaskTemplate = `        
                <li class="main-list--link js-list-item">
                    <div class="main-link">
                        <input class="main-input js-checked-task" type="checkbox" ${checked}>
                        <div>
                           <span class="main-text js-main-text">${valueText}</span>
                           <input class="js-edit-task" type="text" value="${valueText}" style="display: none">  
                        </div>
                    </div>
                    <button class="btn btn-danger js-delete-task">x</button>
                </li>
             `;

            $mainList.insertAdjacentHTML('beforeend', htmlTaskTemplate);
            $formAddInput.value = "";

            updateFilters();

            const $itemTasks = document.querySelectorAll('.js-list-item');
            initialPagination($itemTasks);
        } else {
            alert('Заполните поле');
        }
    }


    // выделить все задачи выполненными
    function onSelectAllTasks() {
        const $checkboxTasks = document.querySelectorAll('.js-checked-task');

        if (this.checked) {
            $checkboxTasks.forEach(function (item) {
                item.checked = true;
            });
            updateFilters();
        } else {
            $checkboxTasks.forEach(function (item) {
                item.checked = false;
            });
            updateFilters();
        };
    };

    // Удаление задачи
    function onDeleteTask(e) {
        const $btnDelete = e.target.closest('.js-delete-task');

        if ($btnDelete) {
            const $itemTasks = document.querySelectorAll('.js-list-item');
            const $itemTask = $btnDelete.closest('.js-list-item');

            $itemTask.remove();
            initialPagination($itemTasks);
        }

        updateFilters();
    }

    // Открытие инпута для редактирования задачи
    function onShowEdit(event) {
        if (event.target.classList.contains('js-main-text')) {
            let $spanText = event.target;
            let $inputEditTask = event.target.nextElementSibling;

            startEditing($inputEditTask, $spanText);

            $inputEditTask.addEventListener('keypress', onKeyPress);
            $inputEditTask.addEventListener('blur', onBlur);

            $inputEditTask.focus();
        }
    }

    // Редактирование задачи
    function onEditTask(event) {

        if (event.target.classList.contains('js-edit-task')) {
            const $inputEditTask = event.target;

            $inputEditTask.addEventListener('keydown', onKeyPress);
            $inputEditTask.addEventListener('blur', onBlur);
        }
    }

    // Сохранение задачи при нажатии на Enter
    function onKeyPress(event) {
        const $inputEditTask = event.target;
        const $spanText = event.target.previousElementSibling;
        const valueText = $spanText.textContent;

        if (event.key === 'Enter') {
            saveChanges($inputEditTask);
            cleanup($inputEditTask);
        }

        if (event.key === 'Escape') {
            $inputEditTask.value = valueText;
            finishEditing($inputEditTask, $spanText)
            cleanup($inputEditTask);
        }
    }

    // Сохранение задачи при потери фокуса
    function onBlur(event) {
        const $inputEditTask = event.target;
        saveChanges($inputEditTask);
        cleanup($inputEditTask);
    }

    // Фильтрация по задачам
    function onFilterTasks(event) {
        const $el = event.target;

        if ($el.closest('[data-filter="all"]')) {
            updateActiveClassFilter("all");
            filterTasks('all');
        }

        if ($el.closest('[data-filter="active"]')) {
            updateActiveClassFilter("active");
            filterTasks('active');
        }

        if ($el.closest('[data-filter="completed"]')) {
            updateActiveClassFilter("completed");
            filterTasks('completed');
        }
    }

    // Удалить все выполненные задачи
    function onDeleteAllCompleted() {
        const $itemTasks = document.querySelectorAll('.js-list-item');
        const fragment = document.createDocumentFragment();

        $itemTasks.forEach(function(item) {
            const $checkedTask = item.querySelector('.js-checked-task');

            if ($checkedTask.checked) {
                fragment.appendChild(item);
            }
        });

        fragment.textContent = '';

        let $updateTasksAll = document.querySelectorAll('.js-list-item');
        // console.log('$updateTasksAll', $updateTasksAll);
        updateFilters();
        initialPagination($updateTasksAll);
    }

    // Вспомогательные функции
    function updateActiveClassFilter(filterType = 'all') {
        $filterButtons.forEach($btnFilter => {
            $btnFilter.classList.remove('main-btn--active');

            if ($btnFilter.dataset.filter === filterType) {
                $btnFilter.classList.add('main-btn--active');
            }
        });
    }


    function filterTasks(filterType = 'all') {
        const $itemTasks = Array.from(document.querySelectorAll('.js-list-item'));

        $itemTasks.forEach(($task) => {
            $task.classList.add('main-list--none');
        });

        if (filterType === 'all') {
            $itemTasks.forEach(($task) => {
                $task.classList.remove('main-list--none');
            });

            const $tasks = $itemTasks.filter(function(item) {
                if (!item.classList.contains('main-list--none')) {
                    return true;
                }
            });

            initialPagination($tasks);
        };

        if (filterType === 'active') {
            $itemTasks.forEach(($task) => {
                const $checkbox = $task.querySelector('.js-checked-task');

                if (!$checkbox.checked) {
                    $task.classList.remove('main-list--none');
                }
            });

            const $tasks = $itemTasks.filter(function(item) {
                if (!item.classList.contains('main-list--none')) {
                    return true;
                }
            });

            initialPagination($tasks);
        }

        if (filterType === 'completed') {
            // console.log('Окей')

            $itemTasks.forEach(($task) => {
                const $checkbox = $task.querySelector('.js-checked-task');

                if ($checkbox.checked) {
                    $task.classList.remove('main-list--none')
                }
            });

            const $tasks = $itemTasks.filter(function(item) {
                if (!item.classList.contains('main-list--none')) {
                    return true;
                }
            });
            initialPagination($tasks);
        };
    };

    function updateFilters() {
        let $itemTasks = Array.from(document.querySelectorAll('.js-list-item'));

        let $countAll = document.querySelector('.js-number-all');
        let $countActive = document.querySelector('.js-number-active');
        let $countCompleted = document.querySelector('.js-number-completed');

        $countAll.textContent = String($itemTasks.length);

        $countActive.textContent = String($itemTasks.filter(function (item) {
            const checkbox = item.querySelector('.js-checked-task');
            return checkbox.checked === false;
        }).length);

        $countCompleted.textContent = String($itemTasks.filter(function (item) {
            const checkbox = item.querySelector('.js-checked-task');
            return checkbox.checked === true;
        }).length);
    }

    function saveChanges($inputEditTask) {
        const $spanText = $inputEditTask.previousElementSibling;

        if ($inputEditTask.value.trim()) {
            $spanText.textContent = $inputEditTask.value;
            finishEditing($inputEditTask, $spanText);
        } else {
            alert('Поле не может быть пустым');
            return undefined;
        }
    }

    function initialPagination($itemsTask = []) {
        const pagesNumber = Math.ceil($itemsTask.length / 5);

        displayListItems(1, $itemsTask);

        $pagination.innerHTML = '';

        for (let i = 0; i < pagesNumber; i++) {
            const number = i + 1;

            let htmlButtonTemplate = `
                <button class="pagination__item js-pagination-btn ${i === 0 ? 'pagination__item--active' : ''}" type="button">${number}</button>
            `;

            $pagination.insertAdjacentHTML('beforeend', htmlButtonTemplate);
        }

        const $paginationButtons = document.querySelectorAll('.js-pagination-btn');

        $paginationButtons.forEach(btn => {
            btn.addEventListener('click', function () {
                document.querySelectorAll('.js-pagination-btn').forEach(button => {
                    button.classList.remove('pagination__item--active');
                });

                displayListItems(parseInt(this.textContent), $itemsTask);

                this.classList.add('pagination__item--active');
            });
        });
    };

    function displayListItems(pageNumber , $itemsTask = []) {
        const itemsPerPage = 5;

        const listItemsArray = Array.from($itemsTask);
        const pages = _.chunk(listItemsArray, itemsPerPage);

        if ($itemsTask.length) {
            $itemsTask.forEach(item => item.classList.add('page-pagination-none'));

            const $itemsToShow = pages[pageNumber - 1];
            $itemsToShow.forEach(item => item.classList.remove('page-pagination-none'));
        }
    }

    function cleanup($inputEditTask) {
        $inputEditTask.removeEventListener('keypress', onKeyPress);
        $inputEditTask.removeEventListener('blur', onBlur);
    }

    function startEditing($inputEditTask, $spanText) {
        $inputEditTask.style.display = 'block';
        $spanText.style.display = 'none';
    }

    function finishEditing($inputEditTask, $spanText) {
        $inputEditTask.style.display = 'none';
        $spanText.style.display = 'block';
    }


  // Различные слушатели событий
  $formAdd.addEventListener('submit', onAddTask);
  $mainList.addEventListener('click', onDeleteTask);
  $mainList.addEventListener('dblclick', onShowEdit);
  $mainList.addEventListener('input', onEditTask);
  $filterBox.addEventListener('click', onFilterTasks);
  $btnDeleteAllCompleted.addEventListener('click', onDeleteAllCompleted);
  $checkboxSelectAllTasks.addEventListener('change', onSelectAllTasks);
});
