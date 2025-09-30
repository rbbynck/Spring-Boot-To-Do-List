package com.todolistapp.To_Do_List.App.repository;

import com.todolistapp.To_Do_List.App.model.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ListRepository extends JpaRepository<List, Long> {
    @Query("SELECT l FROM List l WHERE l.user_id = ?1")
    Optional<java.util.List<List>> findByUserId(Long user_id);
}
