package com.todolistapp.To_Do_List.App.repository;

import com.todolistapp.To_Do_List.App.model.TaskNote;
import com.todolistapp.To_Do_List.App.model.Tasks;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TasksRepository extends JpaRepository<Tasks, Long> {
    @Query("SELECT t FROM Tasks t WHERE t.list_id = ?1")
    Optional<List<Tasks>> findByListId(Long list_id);
}
