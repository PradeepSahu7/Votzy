document
  .getElementById("searchResultForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const electionName = document.getElementById("electionName").value;
    const requestData = { electionName: electionName };

    // Show loading state
    const searchSection = document.getElementById("searchSection");
    const resultsSection = document.getElementById("resultsSection");
    const loadingResults = document.getElementById("loadingResults");

    searchSection.style.display = "none";
    resultsSection.style.display = "none";
    loadingResults.style.display = "block";

    fetch(`http://localhost:8080/api/election-results/declare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Election not found");
        }
        return res.json();
      })
      .then((data) => {
        console.log(data);

        // Update election title
        document.getElementById("electionTitle").textContent =
          data.electionName;

        // Calculate statistics
        const winPercentage = (
          (data.winnerVotes / data.totalVotes) *
          100
        ).toFixed(1);
        const otherVotes = data.totalVotes - data.winnerVotes;
        const otherPercentage = ((otherVotes / data.totalVotes) * 100).toFixed(
          1
        );

        // Create enhanced results HTML
        let resultHTML = `
					<div class="col-12 mb-4">
						<div class="alert alert-success text-center">
							<h2 class="mb-3">
								<i class="fas fa-crown text-warning me-2"></i>
								Election Results Declared!
							</h2>
							<p class="mb-0 lead">Election: <strong>${data.electionName}</strong></p>
						</div>
					</div>
					
					<!-- Winner Card -->
					<div class="col-lg-8 mx-auto mb-4">
						<div class="card border-success shadow-lg">
							<div class="card-header bg-success text-white text-center">
								<h3 class="mb-0">
									<i class="fas fa-trophy me-2"></i>Winner
								</h3>
							</div>
							<div class="card-body text-center p-5">
								<div class="row align-items-center">
									<div class="col-md-4">
										<div class="bg-warning bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 100px; height: 100px;">
											<i class="fas fa-user-tie text-white fa-3x"></i>
										</div>
									</div>
									<div class="col-md-8">
										<h2 class="text-success mb-2">${
                      data.winnerName || `Candidate #${data.winnerId}`
                    }</h2>
										<div class="mb-3">
											<span class="badge bg-primary fs-6 px-3 py-2">
												<i class="fas fa-flag me-2"></i>${data.winnerParty || "Independent"}
											</span>
										</div>
										<div class="row g-3">
											<div class="col-6">
												<div class="bg-light p-3 rounded">
													<h3 class="text-success mb-1">${data.winnerVotes}</h3>
													<small class="text-muted">Votes Received</small>
												</div>
											</div>
											<div class="col-6">
												<div class="bg-light p-3 rounded">
													<h3 class="text-primary mb-1">${winPercentage}%</h3>
													<small class="text-muted">Vote Share</small>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<!-- Statistics Cards -->
					<div class="col-lg-3 col-md-6 mb-3">
						<div class="card text-center shadow-hover h-100">
							<div class="card-body">
								<div class="bg-primary bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 60px; height: 60px;">
									<i class="fas fa-vote-yea text-white fa-2x"></i>
								</div>
								<h3 class="text-primary">${data.totalVotes}</h3>
								<p class="text-muted mb-0">Total Votes Cast</p>
							</div>
						</div>
					</div>

					<div class="col-lg-3 col-md-6 mb-3">
						<div class="card text-center shadow-hover h-100">
							<div class="card-body">
								<div class="bg-success bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 60px; height: 60px;">
									<i class="fas fa-trophy text-white fa-2x"></i>
								</div>
								<h3 class="text-success">${data.winnerVotes}</h3>
								<p class="text-muted mb-0">Winning Votes</p>
							</div>
						</div>
					</div>

					<div class="col-lg-3 col-md-6 mb-3">
						<div class="card text-center shadow-hover h-100">
							<div class="card-body">
								<div class="bg-warning bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 60px; height: 60px;">
									<i class="fas fa-flag text-white fa-2x"></i>
								</div>
								<h4 class="text-warning text-truncate" style="font-size: 1.2rem;">${
                  data.winnerParty || "Independent"
                }</h4>
								<p class="text-muted mb-0">Winning Party</p>
							</div>
						</div>
					</div>

					<div class="col-lg-3 col-md-6 mb-3">
						<div class="card text-center shadow-hover h-100">
							<div class="card-body">
								<div class="bg-info bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 60px; height: 60px;">
									<i class="fas fa-percentage text-white fa-2x"></i>
								</div>
								<h3 class="text-info">${winPercentage}%</h3>
								<p class="text-muted mb-0">Victory Margin</p>
							</div>
						</div>
					</div>

					<!-- Vote Distribution -->
					<div class="col-12 mt-4">
						<div class="card">
							<div class="card-header">
								<h5 class="mb-0">
									<i class="fas fa-chart-bar me-2"></i>Vote Distribution
								</h5>
							</div>
							<div class="card-body">
								<div class="row">
									<div class="col-md-6">
										<div class="d-flex align-items-center mb-2">
											<div class="bg-success" style="width: 20px; height: 20px; border-radius: 3px;"></div>
											<span class="ms-2 fw-medium">Winner: ${
                        data.winnerName || `Candidate #${data.winnerId}`
                      } (${data.winnerParty || "Independent"})</span>
										</div>
										<div class="progress mb-3" style="height: 25px;">
											<div class="progress-bar bg-success" style="width: ${winPercentage}%">
												${data.winnerVotes} votes (${winPercentage}%)
											</div>
										</div>
									</div>
									<div class="col-md-6">
										<div class="d-flex align-items-center mb-2">
											<div class="bg-secondary" style="width: 20px; height: 20px; border-radius: 3px;"></div>
											<span class="ms-2 fw-medium">Other Candidates</span>
										</div>
										<div class="progress mb-3" style="height: 25px;">
											<div class="progress-bar bg-secondary" style="width: ${otherPercentage}%">
												${otherVotes} votes (${otherPercentage}%)
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				`;

        document.getElementById("resultsContainer").innerHTML = resultHTML;

        // Create charts if function exists
        if (typeof createCharts === "function") {
          createCharts(data);
        }

        // Show results section
        loadingResults.style.display = "none";
        resultsSection.style.display = "block";

        // Scroll to results
        resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });

        // Show success message
        Swal.fire({
          title: "Results Found!",
          text: `Election results for "${data.electionName}" have been loaded successfully.`,
          icon: "success",
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      })
      .catch((error) => {
        console.error("Error fetching results:", error);

        loadingResults.style.display = "none";
        searchSection.style.display = "block";

        Swal.fire({
          title: "Results Not Found",
          html: `
						<div class="text-center">
							<i class="fas fa-search fa-3x text-muted mb-3"></i>
							<p>No election results found for "<strong>${electionName}</strong>".</p>
							<p class="text-muted small">Please check the election name and try again.</p>
						</div>
					`,
          icon: "warning",
          confirmButtonText: "Try Again",
          confirmButtonColor: "#ed8936",
        });
      });
  });

// Add back to search functionality
function backToSearch() {
  document.getElementById("searchSection").style.display = "block";
  document.getElementById("resultsSection").style.display = "none";
  document.getElementById("electionName").value = "";
  document.getElementById("electionName").focus();
}

// Add this functionality to the back button if needed
document.addEventListener("DOMContentLoaded", function () {
  // Add back button to results section if it doesn't exist
  const resultsHeader = document.querySelector("#resultsSection .card-header");
  if (resultsHeader && !resultsHeader.querySelector(".btn-back")) {
    const backButton = document.createElement("button");
    backButton.className = "btn btn-outline-secondary btn-sm btn-back";
    backButton.innerHTML = '<i class="fas fa-arrow-left"></i> New Search';
    backButton.onclick = backToSearch;
    resultsHeader.querySelector(".d-flex").appendChild(backButton);
  }
});
