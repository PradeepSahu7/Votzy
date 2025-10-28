document.addEventListener("DOMContentLoaded", () => {
  loadVoters();
});

// Load all voters
function loadVoters() {
  const loadingState = document.getElementById("voterLoadingState");
  const emptyState = document.getElementById("voterEmptyState");
  const votersContainer = document.getElementById("votersContainer");

  // Show loading state
  if (loadingState) loadingState.style.display = "block";
  if (emptyState) emptyState.style.display = "none";

  fetch("http://localhost:8080/api/voters")
    .then((res) => res.json())
    .then((data) => {
      votersContainer.innerHTML = "";

      if (data && data.length > 0) {
        data.forEach((voter, index) => {
          votersContainer.innerHTML += `
                        <tr class="animate__animated animate__fadeInUp" style="animation-delay: ${
                          index * 0.1
                        }s;">
                            <td class="text-center fw-bold text-primary">#${
                              voter.id
                            }</td>
                            <td>
								<div class="d-flex align-items-center">
									<div class="bg-success bg-gradient rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 40px; height: 40px;">
										<i class="fas fa-user text-white"></i>
									</div>
									<div>
										<div class="fw-bold">${voter.name}</div>
										<small class="text-muted">Voter ID: ${voter.id}</small>
									</div>
								</div>
							</td>
                            <td>
								<div class="d-flex align-items-center">
									<div class="bg-info bg-gradient rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 30px; height: 30px;">
										<i class="fas fa-envelope text-white fa-sm"></i>
									</div>
									<div>
										<span class="fw-medium">${voter.email}</span>
										<br>
										<small class="text-success">
											<i class="fas fa-check-circle me-1"></i>Verified
										</small>
									</div>
								</div>
							</td>
                            <td class="text-center">
								<div class="btn-group" role="group">
									<button class="btn btn-outline-info btn-sm shadow-hover" onclick="viewVoterDetails(${
                    voter.id
                  })" title="View Profile">
										<i class="fas fa-eye"></i>
									</button>
									<button class="btn btn-outline-warning btn-sm shadow-hover" onclick="sendNotification(${
                    voter.id
                  })" title="Send Notification">
										<i class="fas fa-bell"></i>
									</button>
									<button class="btn btn-outline-danger btn-sm shadow-hover" onclick="deleteVoter(${
                    voter.id
                  })" title="Remove Voter">
										<i class="fas fa-trash"></i>
									</button>
								</div>
                            </td>
                        </tr>
                    `;
        });

        // Update statistics if function exists
        if (typeof updateVoterStatistics === "function") {
          updateVoterStatistics();
        }
      } else {
        if (emptyState) emptyState.style.display = "block";
      }
    })
    .catch((error) => {
      console.error("Error loading voters:", error);
      showAlert("Error", "Failed to load voters. Please try again.", "error");
      if (emptyState) emptyState.style.display = "block";
    })
    .finally(() => {
      // Hide loading state
      if (loadingState) loadingState.style.display = "none";
    });
}

// Register voter
document
  .getElementById("voterForm")
  ?.addEventListener("submit", function (event) {
    event.preventDefault();
    const voterData = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
    };

    fetch("http://localhost:8080/api/voters/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(voterData),
    })
      .then(() => {
        showAlert("Success", "Voter registered successfully!", "success");
        document.getElementById("voterForm").reset();
        loadVoters();
      })
      .catch(() => showAlert("Error", "Voter registration failed.", "error"));
  });

// View voter details
function viewVoterDetails(voterId) {
  // Show loading
  Swal.fire({
    title: "Loading...",
    html: '<div class="spinner-border text-success" role="status"></div>',
    showConfirmButton: false,
    allowOutsideClick: false,
  });

  fetch(`http://localhost:8080/api/voters/${voterId}`)
    .then((res) => {
      if (!res.ok) throw new Error("Voter not found");
      return res.json();
    })
    .then((voter) => {
      Swal.fire({
        title: `<i class="fas fa-user text-success"></i> Voter Profile`,
        html: `
					<div class="text-start">
						<div class="card border-0">
							<div class="card-body">
								<div class="row g-3">
									<div class="col-12 text-center mb-3">
										<div class="bg-success bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 80px; height: 80px;">
											<i class="fas fa-user text-white fa-2x"></i>
										</div>
									</div>
									<div class="col-6">
										<strong class="text-muted">Voter ID:</strong>
									</div>
									<div class="col-6">
										<span class="badge bg-success">#${voter.id}</span>
									</div>
									<div class="col-6">
										<strong class="text-muted">Full Name:</strong>
									</div>
									<div class="col-6">
										<span class="fw-bold">${voter.name}</span>
									</div>
									<div class="col-6">
										<strong class="text-muted">Email Address:</strong>
									</div>
									<div class="col-6">
										<span class="fw-medium">${voter.email}</span>
									</div>
									<div class="col-6">
										<strong class="text-muted">Status:</strong>
									</div>
									<div class="col-6">
										<span class="badge bg-primary">Active</span>
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
          '<small class="text-muted">Voter information retrieved successfully</small>',
      });
    })
    .catch((error) => {
      console.error("Error fetching voter:", error);
      Swal.fire({
        title: "Not Found",
        text: `Voter with ID ${voterId} was not found in the system.`,
        icon: "error",
        confirmButtonText: '<i class="fas fa-times"></i> Close',
        confirmButtonColor: "#f56565",
      });
    });
}

// Send notification to voter
function sendNotification(voterId) {
  Swal.fire({
    title: '<i class="fas fa-bell text-warning"></i> Send Notification',
    html: `
			<div class="text-start">
				<label class="form-label fw-bold">Notification Message:</label>
				<textarea id="notificationMessage" class="swal2-textarea" placeholder="Enter your message to the voter..." rows="4"></textarea>
			</div>
		`,
    icon: "info",
    showCancelButton: true,
    confirmButtonText: '<i class="fas fa-paper-plane"></i> Send',
    cancelButtonText: '<i class="fas fa-times"></i> Cancel',
    confirmButtonColor: "#ed8936",
    preConfirm: () => {
      const message = document.getElementById("notificationMessage").value;
      if (!message.trim()) {
        Swal.showValidationMessage("Please enter a message");
        return false;
      }
      return message;
    },
  }).then((result) => {
    if (result.isConfirmed) {
      // Simulate sending notification (you can implement actual notification logic)
      Swal.fire({
        title: "Sent!",
        text: "Notification has been sent to the voter successfully.",
        icon: "success",
        confirmButtonColor: "#48bb78",
        timer: 2000,
        timerProgressBar: true,
      });
    }
  });
}

// Delete voter
function deleteVoter(id) {
  Swal.fire({
    title: "Are you sure?",
    html: `
			<div class="text-center">
				<i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
				<p>This voter will be permanently removed from the system.</p>
				<p class="text-muted small">This action cannot be undone.</p>
			</div>
		`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#f56565",
    cancelButtonColor: "#6c757d",
    confirmButtonText: '<i class="fas fa-trash"></i> Yes, delete it!',
    cancelButtonText: '<i class="fas fa-times"></i> Cancel',
  }).then((result) => {
    if (result.isConfirmed) {
      // Show deleting progress
      Swal.fire({
        title: "Deleting...",
        html: '<div class="spinner-border text-danger" role="status"></div>',
        showConfirmButton: false,
        allowOutsideClick: false,
      });

      fetch(`http://localhost:8080/api/voters/delete/${id}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (response.ok) {
            Swal.fire({
              title: "Deleted!",
              text: "Voter has been successfully removed from the system.",
              icon: "success",
              confirmButtonColor: "#48bb78",
              timer: 2000,
              timerProgressBar: true,
            });
            loadVoters();
          } else {
            throw new Error("Failed to delete voter");
          }
        })
        .catch((error) => {
          console.error("Error deleting voter:", error);
          Swal.fire({
            title: "Error!",
            text: "Failed to delete voter. Please try again.",
            icon: "error",
            confirmButtonColor: "#f56565",
          });
        });
    }
  });
}
