package com.todolistapp.To_Do_List.App.repository;

import com.todolistapp.To_Do_List.App.model.TaskNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskNoteRepository extends JpaRepository<TaskNote, Long> {

    // Get task note by task id
    @Query("SELECT tn FROM TaskNote tn WHERE tn.task_id = ?1")
    Optional<java.util.List<TaskNote>> findByTaskId(Long task_id);
}
