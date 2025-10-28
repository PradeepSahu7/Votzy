package in.scalive.votezy.dto;

import lombok.Data;

@Data
public class ElectionResultResponseDTO {

	private String electionName;
	private int totalVotes;
	private long winnerId;
	private String winnerName;
	private String winnerParty;
	private int winnerVotes;
}
