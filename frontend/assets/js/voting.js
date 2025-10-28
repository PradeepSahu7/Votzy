document.addEventListener("DOMContentLoaded", () => {
  loadCandidates();
  loadVotes();
});

// Load candidates for voting
function loadCandidates() {
  fetch("http://localhost:8080/api/candidates")
    .then((res) => res.json())
    .then((data) => {
      let candidateSelect = document.getElementById("candidateSelect");
      candidateSelect.innerHTML =
        '<option value="">Select a Candidate</option>';
      data.forEach((candidate) => {
        let option = document.createElement("option");
        option.value = candidate.id;
        option.textContent = `${candidate.name} (${candidate.party})`;
        candidateSelect.appendChild(option);
      });
    })
    .catch(() => showAlert("Error", "Failed to load candidates.", "error"));
}

// Load votes
function loadVotes() {
  const loadingState = document.getElementById("votesLoadingState");
  const emptyState = document.getElementById("votesEmptyState");
  const votesTable = document.getElementById("votesTable");

  // Show loading state
  if (loadingState) loadingState.style.display = "block";
  if (emptyState) emptyState.style.display = "none";

  fetch("http://localhost:8080/api/votes")
    .then((res) => res.json())
    .then((data) => {
      votesTable.innerHTML = "";

      if (data && data.length > 0) {
        data.forEach((vote, index) => {
          const timestamp = new Date().toLocaleString(); // Since API doesn't provide timestamp
          votesTable.innerHTML += `
						<tr class="animate__animated animate__fadeInUp" style="animation-delay: ${
              index * 0.1
            }s;">
							<td class="text-center fw-bold text-primary">#${index + 1}</td>
							<td class="text-center">
								<div class="d-flex align-items-center justify-content-center">
									<div class="bg-success bg-gradient rounded-circle d-flex align-items-center justify-content-center me-2" style="width: 30px; height: 30px;">
										<i class="fas fa-user text-white fa-sm"></i>
									</div>
									<span class="fw-medium">${vote.voterId}</span>
								</div>
							</td>
							<td class="text-center">
								<div class="d-flex align-items-center justify-content-center">
									<div class="bg-primary bg-gradient rounded-circle d-flex align-items-center justify-content-center me-2" style="width: 30px; height: 30px;">
										<i class="fas fa-user-tie text-white fa-sm"></i>
									</div>
									<span class="fw-medium">${vote.candidateId}</span>
								</div>
							</td>
							<td class="text-center">
								<small class="text-muted">
									<i class="fas fa-clock me-1"></i>${timestamp}
								</small>
							</td>
						</tr>
					`;
        });

        // Update statistics
        updateVotingStatistics(data.length);
      } else {
        if (emptyState) emptyState.style.display = "block";
      }
    })
    .catch((error) => {
      console.error("Error loading votes:", error);
      showAlert("Error", "Failed to load votes. Please try again.", "error");
      if (emptyState) emptyState.style.display = "block";
    })
    .finally(() => {
      // Hide loading state
      if (loadingState) loadingState.style.display = "none";
    });
}

// Update voting statistics
function updateVotingStatistics(totalVotes) {
  const totalVotesElement = document.getElementById("totalVotesCast");
  const participationElement = document.getElementById("participationRate");

  if (totalVotesElement) {
    totalVotesElement.textContent = totalVotes;
  }

  // Calculate participation rate (assuming we can get total voters from API)
  fetch("http://localhost:8080/api/voters")
    .then((res) => res.json())
    .then((voters) => {
      if (participationElement && voters.length > 0) {
        const rate = Math.round((totalVotes / voters.length) * 100);
        participationElement.textContent = rate + "%";
      }
    })
    .catch(() => {
      if (participationElement) {
        participationElement.textContent = "0%";
      }
    });
}

// Cast vote
document
  .getElementById("voteForm")
  ?.addEventListener("submit", function (event) {
    event.preventDefault();

    const voteData = {
      voterId: document.getElementById("voterId").value,
      candidateId: document.getElementById("candidateSelect").value,
    };

    if (!voteData.voterId || !voteData.candidateId) {
      showAlert(
        "Warning",
        "Please enter your Voter ID and select a candidate.",
        "warning"
      );
      return;
    }

    fetch("http://localhost:8080/api/votes/cast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(voteData),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            throw new Error(err.messageString || "Something went wrong!"); // Extract message properly
          });
        } else {
          return response.json();
        }
      })
      .then((obj) => {
        showAlert("Success", obj.message, "success");
        document.getElementById("voteForm").reset();
        loadVotes();
      })
      .catch((error) => {
        showAlert("Error", error.message, "error");
      });
  });
