package com.todolistapp.To_Do_List.App.controller;

import com.todolistapp.To_Do_List.App.model.TaskNote;
import com.todolistapp.To_Do_List.App.model.Tasks;
import com.todolistapp.To_Do_List.App.model.User;
import com.todolistapp.To_Do_List.App.repository.UserRepository;
import com.todolistapp.To_Do_List.App.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/to-do-list")
public class UserController {
    private final UserRepository userRepository;
    private final UserService userService;

    @Autowired
    public UserController(UserRepository userRepository, UserService userService) {
        this.userRepository = userRepository;
        this.userService = userService;
    }


    // Retrieve lists from user
    @GetMapping("/list")
    public ResponseEntity<List<com.todolistapp.To_Do_List.App.model.List>> getLists(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No Data Found"));

        return ResponseEntity.ok(userService.getLists(user.getId()));
    }

    // Add new list
    @PostMapping("/list")
    public ResponseEntity<Map<String, String>> addNewList(Authentication authentication, @RequestBody com.todolistapp.To_Do_List.App.model.List list) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No Data Found"));

        list.setUser_id(user.getId());
        userService.addNewList(list);

        return ResponseEntity.ok(Map.of("message", "New list saved!"));
    }

    // Update list
    @PutMapping("/list")
    public ResponseEntity<Map<String, String>> updateList(@RequestBody com.todolistapp.To_Do_List.App.model.List list) {
        userService.updateList(list);

        return ResponseEntity.ok(Map.of("message", "List edited successfully!"));
    }

    // Delete list
    @DeleteMapping("/list/delete/{id}")
    public ResponseEntity<Map<String, String>> deleteList(@PathVariable Long id) {
        userService.deleteList(id);

        return ResponseEntity.ok(Map.of("message", "List deleted successfully!"));
    }

    // Get Tasks
    @GetMapping("/task/{id}")
    public ResponseEntity<List<Tasks>> getTasks(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getTasks(id));
    }

    // Add new Task
    @PostMapping("/task")
    public ResponseEntity<Map<String, String>> addNewTask(@RequestBody Tasks tasks) {
        System.out.println(tasks.toString());
        userService.addTasks(tasks);

        return ResponseEntity.ok(Map.of("message", "New task saved!"));
    }

    // Update Task
    @PutMapping("/task")
    public ResponseEntity<Map<String, String>> updateTask(@RequestBody Tasks tasks) {
        System.out.println(tasks.toString());
        userService.editTask(tasks);

        return ResponseEntity.ok(Map.of("message", "Task updated successfully!"));
    }

    // Delete Task
    @DeleteMapping("/task/delete/{id}")
    public ResponseEntity<Map<String, String>> deleteTask(@PathVariable Long id) {
        userService.deleteTask(id);

        return ResponseEntity.ok(Map.of("message", "Task deleted successfully!"));
    }


    // Get Tasks Notes
    @GetMapping("/task-note/{id}")
    public ResponseEntity<List<TaskNote>> getTaskNote(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getTaskNote(id));
    }

    // Add new Task
    @PostMapping("/task-note")
    public ResponseEntity<Map<String, String>> addNewTaskNote(@RequestBody TaskNote taskNote) {
        System.out.println(taskNote.toString());
        userService.addTaskNote(taskNote);

        return ResponseEntity.ok(Map.of("message", "New note saved!"));
    }

    // Update Task
    @PutMapping("/task-note")
    public ResponseEntity<Map<String, String>> updateTaskNote(@RequestBody TaskNote taskNote) {
        userService.updateTaskNote(taskNote);

        return ResponseEntity.ok(Map.of("message", "Note updated successfully!"));
    }

    // Delete Task
    @DeleteMapping("/task-note/delete/{id}")
    public ResponseEntity<Map<String, String>> deleteTaskNote(@PathVariable Long id) {
        userService.deleteTaskNote(id);

        return ResponseEntity.ok(Map.of("message", "Note deleted successfully!"));
    }
}
