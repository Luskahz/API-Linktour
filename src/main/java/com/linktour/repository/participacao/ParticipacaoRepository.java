    package com.linktour.repository.participacao;

    import com.linktour.model.participacoes.ParticipacaoEvento;
    import org.springframework.data.jpa.repository.JpaRepository;

    import java.util.Optional;

    public interface ParticipacaoRepository extends JpaRepository<ParticipacaoEvento, Long> {

        Optional<ParticipacaoEvento> findByUsuarioIdAndEventoId(Long usuarioId, Long eventoId);

        boolean existsByUsuario_IdAndEvento_Id(Long usuarioId, Long eventoId);
        long countByEvento_Id(Long eventoId);
        boolean existsByUsuario_Id(Long id);
    }
