package com.todolistapp.To_Do_List.App.model;

import jakarta.persistence.*;

@Entity
@Table(name = "Task_Notes")
public class TaskNote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "note_id", nullable = false)
    private Long id;
    @Column(name = "task_id", nullable = false)
    private Long task_id;
    @Column(name = "Description", nullable = false)
    private String description;
    @Column(name = "Status")
    private String status;
    @Column(name = "created_date", nullable = false)
    private String created_date;

    public TaskNote() {}

    public TaskNote(Long id, Long task_id, String description, String status, String created_date) {
        this.id = id;
        this.task_id = task_id;
        this.description = description;
        this.status = status;
        this.created_date = created_date;
    }

    public TaskNote(Long task_id, String description, String status, String created_date) {
        this.task_id = task_id;
        this.description = description;
        this.status = status;
        this.created_date = created_date;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTask_id() {
        return task_id;
    }

    public void setTask_id(Long task_id) {
        this.task_id = task_id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCreated_date() {
        return created_date;
    }

    public void setCreated_date(String created_date) {
        this.created_date = created_date;
    }

    @Override
    public String toString() {
        return "TaskNote{" +
                "id=" + id +
                ", task_id=" + task_id +
                ", description='" + description + '\'' +
                ", status='" + status + '\'' +
                ", created_date='" + created_date + '\'' +
                '}';
    }
}
