workflow "Pull Request" {
  on = "pull_request"
  resolves = ["Assignee to reviewer"]
}

action "Assignee to reviewer" {
  uses: "pullreminders/assignee-to-reviewer-action@v1.0.4"
}
