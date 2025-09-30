package com.todolistapp.To_Do_List.App.service;

import com.todolistapp.To_Do_List.App.model.TaskNote;
import com.todolistapp.To_Do_List.App.model.Tasks;
import com.todolistapp.To_Do_List.App.repository.ListRepository;
import com.todolistapp.To_Do_List.App.repository.TaskNoteRepository;
import com.todolistapp.To_Do_List.App.repository.TasksRepository;
import com.todolistapp.To_Do_List.App.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {
    private final ListRepository listRepository;
    private final TaskNoteRepository taskNoteRepository;
    private final TasksRepository tasksRepository;
    private final UserRepository userRepository;

    @Autowired
    public UserService(ListRepository listRepository, TaskNoteRepository taskNoteRepository, TasksRepository tasksRepository, UserRepository userRepository) {
        this.listRepository = listRepository;
        this.taskNoteRepository = taskNoteRepository;
        this.tasksRepository = tasksRepository;
        this.userRepository = userRepository;
    }


    // LISTS SERVICE
    // Get List
    public List<com.todolistapp.To_Do_List.App.model.List> getLists(Long user_id) {
        List<com.todolistapp.To_Do_List.App.model.List> lists = listRepository.findByUserId(user_id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "List data doesn't exists"));
        lists = lists.stream()
                .collect(Collectors.collectingAndThen(
                        Collectors.toList(),
                        lst -> {
                            Collections.reverse(lst);
                            return lst;
                        }));
        return lists;
    }

    // Add List
    @Transactional
    public void addNewList(com.todolistapp.To_Do_List.App.model.List list) {
        list.setCreated_date(String.valueOf(LocalDateTime.now()));
        listRepository.save(list);
    }

    // Update List
    @Transactional
    public void updateList(com.todolistapp.To_Do_List.App.model.List list) {
        listRepository.save(list);
    }

    // Delete List
    public void deleteList(Long id) {
        listRepository.deleteById(id);
    }


    // TASKS SERVICE
    // Get Task
    public List<Tasks> getTasks(Long list_id) {
        List<Tasks> tasks = tasksRepository.findByListId(list_id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tasks data doesn't exists"));
        tasks = tasks.stream()
                .sorted(Comparator
                        .comparing((Tasks task) -> "Done".equals(task.getStatus()) ? 1 : 0) // Sort by status: "To Do" (0) before "Done" (1)
                        .thenComparing(Tasks::getCreated_date, Comparator.reverseOrder())) // Within each group, sort by created date descending
                .collect(Collectors.toList());

        return tasks;
    }

    // Add Task
    @Transactional
    public void addTasks(Tasks tasks) {
        tasks.setCreated_date(String.valueOf(LocalDateTime.now()));
        tasksRepository.save(tasks);
    }

    // Update Task
    @Transactional
    public void editTask(Tasks tasks) {
        tasksRepository.save(tasks);
    }

    // Delete Task
    public void deleteTask(Long id) {
        tasksRepository.deleteById(id);
    }


    // TASKNOTES SERVICE
    // Get TaskNote
    public List<TaskNote> getTaskNote(Long task_id) {
        List<TaskNote> taskNotes = taskNoteRepository.findByTaskId(task_id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Task Note data doesn't exists"));
        taskNotes = taskNotes.stream()
                .collect(Collectors.collectingAndThen(
                        Collectors.toList(),
                        lst -> {
                            Collections.reverse(lst);
                            return lst;
                        }));
        return taskNotes;
    }

    // Add TaskNote
    @Transactional
    public void addTaskNote(TaskNote taskNote) {
        taskNote.setCreated_date(String.valueOf(LocalDateTime.now()));
        taskNoteRepository.save(taskNote);
    }

    // Update TaskNote
    @Transactional
    public void updateTaskNote(TaskNote taskNote) {
        taskNote.setCreated_date(String.valueOf(LocalDateTime.now()));
        taskNoteRepository.save(taskNote);
    }

    // Delete TaskNote
    public void deleteTaskNote(Long id) {
        taskNoteRepository.deleteById(id);
    }
}
