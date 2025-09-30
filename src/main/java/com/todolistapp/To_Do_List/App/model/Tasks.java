package com.todolistapp.To_Do_List.App.model;

import jakarta.persistence.*;

@Entity
@Table(name = "Tasks")
public class Tasks {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "task_id", nullable = false)
    private Long id;
    @Column(name = "list_id", nullable = false)
    private Long list_id;
    @Column(name = "Title", nullable = false)
    private String title;
    @Column(name = "Status", nullable = false)
    private String status;
    @Column(name = "Priority", nullable = false)
    private String priority;
    @Column(name = "created_date", nullable = false)
    private String created_date;
    @Column(name = "due_date")
    private String due_date;
    @Column(name = "done_date")
    private String done_date;

    public Tasks() {
    }

    public Tasks(Long id, Long list_id, String title, String status, String priority, String created_date, String due_date, String done_date) {
        this.id = id;
        this.list_id = list_id;
        this.title = title;
        this.status = status;
        this.priority = priority;
        this.created_date = created_date;
        this.due_date = due_date;
        this.done_date = done_date;
    }

    public Tasks(Long list_id, String title, String status, String priority, String created_date, String due_date, String done_date) {
        this.list_id = list_id;
        this.title = title;
        this.status = status;
        this.priority = priority;
        this.created_date = created_date;
        this.due_date = due_date;
        this.done_date = done_date;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getList_id() {
        return list_id;
    }

    public void setList_id(Long list_id) {
        this.list_id = list_id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
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

    public String getDue_date() {
        return due_date;
    }

    public void setDue_date(String due_date) {
        this.due_date = due_date;
    }

    public String getDone_date() {
        return done_date;
    }

    public void setDone_date(String done_date) {
        this.done_date = done_date;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    @Override
    public String toString() {
        return "Tasks{" +
                "id=" + id +
                ", list_id=" + list_id +
                ", title='" + title + '\'' +
                ", status='" + status + '\'' +
                ", priority='" + priority + '\'' +
                ", created_date='" + created_date + '\'' +
                ", due_date='" + due_date + '\'' +
                ", done_date='" + done_date + '\'' +
                '}';
    }
}
