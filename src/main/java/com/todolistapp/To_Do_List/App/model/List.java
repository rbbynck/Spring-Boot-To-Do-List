package com.todolistapp.To_Do_List.App.model;

import jakarta.persistence.*;

@Entity
@Table(name = "Lists")
public class List {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "list_id", nullable = false)
    private Long id;
    @Column(name = "user_id", nullable = false)
    private Long user_id;
    @Column(name = "Title", nullable = false)
    private String title;
    @Column(name = "Color")
    private String color;
    @Column(name = "Status")
    private String status;
    @Column(name = "created_date", nullable = false)
    private String created_date;

    public List() {}

    public List(Long id, Long user_id, String title, String color, String status, String created_date) {
        this.id = id;
        this.user_id = user_id;
        this.title = title;
        this.color = color;
        this.status = status;
        this.created_date = created_date;
    }

    public List(Long user_id, String title, String color, String status, String created_date) {
        this.user_id = user_id;
        this.title = title;
        this.color = color;
        this.status = status;
        this.created_date = created_date;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUser_id() {
        return user_id;
    }

    public void setUser_id(Long user_id) {
        this.user_id = user_id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
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
}
