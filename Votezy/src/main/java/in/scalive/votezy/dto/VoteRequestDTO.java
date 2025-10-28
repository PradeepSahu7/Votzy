package in.scalive.votezy.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VoteRequestDTO {
      @NotNull(message="Voter ID is required")
	  Long voterId;
      @NotNull(message="Candidate ID is required")
      Long candidateId;
}
