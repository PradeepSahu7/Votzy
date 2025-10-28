document.addEventListener("DOMContentLoaded", () => {
  loadCandidates();
});

// Load all candidates
function loadCandidates() {
  const loadingState = document.getElementById("loadingState");
  const emptyState = document.getElementById("emptyState");
  const candidatesContainer = document.getElementById("candidatesContainer");

  // Show loading state
  if (loadingState) loadingState.style.display = "block";
  if (emptyState) emptyState.style.display = "none";

  fetch("http://localhost:8080/api/candidates")
    .then((res) => res.json())
    .then((data) => {
      candidatesContainer.innerHTML = "";

      if (data && data.length > 0) {
        data.forEach((candidate, index) => {
          candidatesContainer.innerHTML += `
                        <tr class="animate__animated animate__fadeInUp" style="animation-delay: ${
                          index * 0.1
                        }s;">
                            <td class="text-center fw-bold text-primary">#${
                              candidate.id
                            }</td>
                            <td>
								<div class="d-flex align-items-center">
									<div class="bg-primary bg-gradient rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 40px; height: 40px;">
										<i class="fas fa-user text-white"></i>
									</div>
									<div>
										<div class="fw-bold">${candidate.name}</div>
										<small class="text-muted">Candidate ID: ${candidate.id}</small>
									</div>
								</div>
							</td>
                            <td>
								<div class="d-flex align-items-center">
									<div class="bg-success bg-gradient rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 30px; height: 30px;">
										<i class="fas fa-flag text-white fa-sm"></i>
									</div>
									<span class="fw-medium">${candidate.party}</span>
								</div>
							</td>
                            <td class="text-center">
								<div class="btn-group" role="group">
									<button class="btn btn-outline-info btn-sm shadow-hover" onclick="viewCandidateDetails(${
                    candidate.id
                  })" title="View Details">
										<i class="fas fa-eye"></i>
									</button>
									<button class="btn btn-outline-warning btn-sm shadow-hover" onclick="editCandidate(${
                    candidate.id
                  })" title="Edit">
										<i class="fas fa-edit"></i>
									</button>
									<button class="btn btn-outline-danger btn-sm shadow-hover" onclick="deleteCandidate(${
                    candidate.id
                  })" title="Delete">
										<i class="fas fa-trash"></i>
									</button>
								</div>
                            </td>
                        </tr>
                    `;
        });

        // Update statistics if function exists
        if (typeof updateStatistics === "function") {
          updateStatistics();
        }
      } else {
        if (emptyState) emptyState.style.display = "block";
      }
    })
    .catch((error) => {
      console.error("Error loading candidates:", error);
      showToast("Error loading candidates. Please try again.", "error");
      if (emptyState) emptyState.style.display = "block";
    })
    .finally(() => {
      // Hide loading state
      if (loadingState) loadingState.style.display = "none";
    });
}

// Add candidate
document
  .getElementById("candidateForm")
  ?.addEventListener("submit", function (event) {
    event.preventDefault();
    const candidateData = {
      name: document.getElementById("candidateName").value,
      party: document.getElementById("party").value,
    };

    fetch("http://localhost:8080/api/candidates/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(candidateData),
    })
      .then(() => {
        showToast("Candidate added successfully!", "success");
        document.getElementById("candidateForm").reset();
        loadCandidates();
      })
      .catch(() => showToast("Failed to add candidate.", "error"));
  });

// Search candidate by ID
function searchCandidate() {
  Swal.fire({
    title: "Search Candidate",
    html: `
			<div class="text-start">
				<label class="form-label fw-bold">Enter Candidate ID:</label>
				<input type="number" id="searchCandidateId" class="swal2-input" placeholder="e.g. 1, 2, 3..." min="1">
			</div>
		`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: '<i class="fas fa-search"></i> Search',
    cancelButtonText: '<i class="fas fa-times"></i> Cancel',
    confirmButtonColor: "#667eea",
    preConfirm: () => {
      const candidateId = document.getElementById("searchCandidateId").value;
      if (!candidateId) {
        Swal.showValidationMessage("Please enter a candidate ID");
        return false;
      }
      return candidateId;
    },
  }).then((result) => {
    if (result.isConfirmed) {
      viewCandidateDetails(result.value);
    }
  });
}

// View candidate details
function viewCandidateDetails(candidateId) {
  // Show loading
  Swal.fire({
    title: "Loading...",
    html: '<div class="spinner-border text-primary" role="status"></div>',
    showConfirmButton: false,
    allowOutsideClick: false,
  });

  fetch(`http://localhost:8080/api/candidates/${candidateId}`)
    .then((res) => {
      if (!res.ok) throw new Error("Candidate not found");
      return res.json();
    })
    .then((candidate) => {
      Swal.fire({
        title: `<i class="fas fa-user-tie text-primary"></i> Candidate Profile`,
        html: `
					<div class="text-start">
						<div class="card border-0">
							<div class="card-body">
								<div class="row g-3">
									<div class="col-12 text-center mb-3">
										<div class="bg-primary bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 80px; height: 80px;">
											<i class="fas fa-user text-white fa-2x"></i>
										</div>
									</div>
									<div class="col-6">
										<strong class="text-muted">Candidate ID:</strong>
									</div>
									<div class="col-6">
										<span class="badge bg-primary">#${candidate.id}</span>
									</div>
									<div class="col-6">
										<strong class="text-muted">Full Name:</strong>
									</div>
									<div class="col-6">
										<span class="fw-bold">${candidate.name}</span>
									</div>
									<div class="col-6">
										<strong class="text-muted">Political Party:</strong>
									</div>
									<div class="col-6">
										<span class="badge bg-success">${candidate.party}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				`,
        icon: "success",
        confirmButtonText: '<i class="fas fa-check"></i> Got it',
        confirmButtonColor: "#48bb78",
        footer:
          '<small class="text-muted">Candidate information retrieved successfully</small>',
      });
    })
    .catch((error) => {
      console.error("Error fetching candidate:", error);
      Swal.fire({
        title: "Not Found",
        text: `Candidate with ID ${candidateId} was not found in the system.`,
        icon: "error",
        confirmButtonText: '<i class="fas fa-times"></i> Close',
        confirmButtonColor: "#f56565",
      });
    });
}

// Update candidate details
// function updateCandidate(id) {
// 	let newName = prompt("Enter new candidate name:");
// 	let newParty = prompt("Enter new party name:");

// 	if (!newName || !newParty) return;

// 	fetch(`http://localhost:8080/api/candidates/${id}`, {
// 		method: "PUT",
// 		headers: { "Content-Type": "application/json" },
// 		body: JSON.stringify({ name: newName, party: newParty }),
// 	})
// 		.then(() => {
// 			showToast("Candidate updated successfully!", "success");
// 			loadCandidates();
// 		})
// 		.catch(() => showToast("Failed to update candidate.", "error"));
// }
function editCandidate(candidateId) {
  Swal.fire({
    title: "Edit Candidate Details",
    html: `<input type="text" id="newName" class="swal2-input" placeholder="Enter new name">
             <input type="text" id="newParty" class="swal2-input" placeholder="Enter new party">`,
    showCancelButton: true,
    confirmButtonText: "Update",
    preConfirm: () => {
      let newName = document.getElementById("newName").value;
      let newParty = document.getElementById("newParty").value;

      if (!newName || !newParty) {
        Swal.showValidationMessage("Both fields are required!");
        return false;
      }

      return { newName, newParty };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      updateCandidate(candidateId, result.value.newName, result.value.newParty);
    }
  });
}

// Function to send updated candidate details to backend
function updateCandidate(candidateId, newName, newParty) {
  fetch(`http://localhost:8080/api/candidates/update/${candidateId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: newName, party: newParty }),
  })
    .then(() => {
      showToast("Candidate updated successfully!", "success");
      loadCandidates();
    })
    .catch(() => showToast("Failed to update candidate.", "error"));
}
// Delete candidate
function deleteCandidate(id) {
  Swal.fire({
    title: "Are you sure?",
    text: "This candidate will be permanently deleted.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d9534f",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`http://localhost:8080/api/candidates/delete/${id}`, {
        method: "DELETE",
      })
        .then(() => {
          showToast("Candidate deleted!", "success");
          loadCandidates();
        })
        .catch(() => showToast("Failed to delete candidate.", "error"));
    }
  });
}

// Show toast notification
function showToast(message, type = "info") {
  Swal.fire({
    toast: true,
    position: "top-end",
    icon: type,
    title: message,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
}
